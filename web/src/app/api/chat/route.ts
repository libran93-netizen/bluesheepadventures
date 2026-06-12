import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { ai, CHAT_MODEL, EMBEDDING_MODEL, ITINERARY_FALLBACK_MODEL, SYSTEM_PROMPT } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, messageCount } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch chat session to check metering
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("lead_id, free_messages_used")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 400 });
    }

    // 2. Fetch lead to see if they are premium (subscription)
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("user_id")
      .eq("id", session.lead_id)
      .single();

    let isPremium = false;
    if (lead && lead.user_id) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("ai_unlimited, expires_at")
        .eq("user_id", lead.user_id)
        .single();

      if (subscription) {
        const isExpired = subscription.expires_at 
          ? new Date(subscription.expires_at).getTime() < Date.now()
          : true;
        if (subscription.ai_unlimited && !isExpired) {
          isPremium = true;
        }
      }
    }

    // Check free message limit (cap at 3 messages)
    const currentUsed = session.free_messages_used || 0;
    if (!isPremium && currentUsed >= 3) {
      return new Response(
        `event: limit_reached\ndata: {"error":"Free message limit reached"}\n\n`,
        {
          status: 402,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        }
      );
    }

    // 3. Increment message usage counter if user is not premium
    if (!isPremium) {
      const { error: updateError } = await supabase
        .from("chat_sessions")
        .update({ free_messages_used: currentUsed + 1 })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Failed to increment free message counter:", updateError);
      }
    }

    // 4. Retrieve context using RAG
    const aiClient = ai();
    let ragContext = "";

    if (aiClient) {
      try {
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        if (lastUserMessage) {
          // Generate embedding for query
          const embedRes = await aiClient.embeddings.create({
            model: EMBEDDING_MODEL,
            input: lastUserMessage,
            encoding_format: "float",
            extra_body: { input_type: "query" },
          } as any);

          const queryEmbedding = embedRes.data[0].embedding;

          // Call RPC for vector comparison
          const { data: chunks, error: rpcError } = await supabase.rpc("match_chunks", {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: 4,
          });

          if (!rpcError && chunks && chunks.length > 0) {
            ragContext = chunks.map((c: any) => c.chunk_text).join("\n\n");
          }
        }
      } catch (ragErr) {
        console.error("RAG search failed, falling back to basic prompting:", ragErr);
      }
    }

    // Construct grounded system prompt
    const finalSystemPrompt = `${SYSTEM_PROMPT}
    
GROUNDING CONTEXT (TRUTH LAYER — ONLY USE INFORMATION BELOW TO ANSWER DETAILS):
${ragContext || "No verified trail or guide records were found for this query in the database. Politely indicate we don't cover this location yet if they ask for details."}`;

    // 5. Streaming chat completion via NVIDIA NIM
    const encoder = new TextEncoder();
    
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          if (aiClient) {
            const responseStream = (await aiClient.chat.completions.create({
              model: CHAT_MODEL,
              messages: [
                { role: "system", content: finalSystemPrompt },
                ...messages.map((m: any) => ({
                  role: m.sender === "user" ? "user" : "assistant",
                  content: m.text,
                })),
              ],
              temperature: 1.0,
              top_p: 0.95,
              stream: true,
              extra_body: { chat_template_kwargs: { enable_thinking: false } }
            } as any)) as any;

            let streamedAnswer = "";

            for await (const chunk of responseStream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                streamedAnswer += text;
                controller.enqueue(encoder.encode(`data: ${text}\n`));
              }
            }

            // 6. Generate Itinerary on the 3rd turn (currentUsed === 2)
            if (!isPremium && currentUsed === 2) {
              try {
                // Prompt template for Llama guided_json call
                const itinerarySchema = {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    duration: { type: "string" },
                    maxAltitude: { type: "string" },
                    difficulty: { type: "string" },
                    companions: { type: "string" },
                    days: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          day: { type: "integer" },
                          title: { type: "string" },
                          details: { type: "string" }
                        },
                        required: ["day", "title", "details"]
                      }
                    },
                    guide: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        rating: { type: "string" },
                        trips: { type: "string" },
                        phone: { type: "string" }
                      },
                      required: ["name", "rating", "trips", "phone"]
                    }
                  },
                  required: ["title", "duration", "maxAltitude", "difficulty", "companions", "days", "guide"]
                };

                const itineraryPrompt = `You are a structured itinerary generator. Review the following conversation and context, then generate a day-by-day itinerary JSON object matching the schema.
                
Conversation:
${messages.map((m: any) => `${m.sender}: ${m.text}`).join("\n")}

Context:
${ragContext}`;

                const jsonCompletion = await aiClient.chat.completions.create({
                  model: ITINERARY_FALLBACK_MODEL,
                  messages: [
                    { role: "system", content: "You output valid structured JSON itineraries only." },
                    { role: "user", content: itineraryPrompt }
                  ],
                  extra_body: {
                    nvext: {
                      guided_json: JSON.stringify(itinerarySchema)
                    }
                  }
                } as any);

                const itineraryJsonText = jsonCompletion.choices[0]?.message?.content || "";
                if (itineraryJsonText) {
                  const itineraryObj = JSON.parse(itineraryJsonText);
                  
                  // Save itinerary to database
                  const { error: insertError } = await supabase
                    .from("itineraries")
                    .insert({
                      source: "ai_generated",
                      trek: itineraryObj.title,
                      content: itineraryObj,
                      lead_id: session.lead_id,
                    });

                  if (insertError) {
                    console.error("Failed to save generated itinerary:", insertError);
                  }

                  // Stream itinerary payload
                  controller.enqueue(encoder.encode(`event: itinerary\n`));
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(itineraryObj)}\n\n`));
                }
              } catch (itineraryErr) {
                console.error("Itinerary generation failed:", itineraryErr);
              }
            }

          } else {
            // Mock streaming if no apiClient
            const mockText = `This is a simulated expert response since the NVIDIA API key is not configured.
            For your Himalayan route, make sure to drink at least 4-5 liters of water daily, monitor your altitude gain, and ensure you climb with a verified local guide who understands Wilderness First Responder guidelines.`;
            
            const words = mockText.split(" ");
            for (const word of words) {
              controller.enqueue(encoder.encode(`data: ${word} \n`));
              await new Promise((resolve) => setTimeout(resolve, 60));
            }
          }
          
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (err: any) {
    console.error("General API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
