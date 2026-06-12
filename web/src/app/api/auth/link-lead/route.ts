import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, companions } = await req.json();

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone, and email are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 1. Find or create the lead based on phone number (deduplication)
    // We try to select first.
    const { data: existingLeads, error: fetchError } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone);

    if (fetchError) {
      throw fetchError;
    }

    let leadId = "";

    if (existingLeads && existingLeads.length > 0) {
      leadId = existingLeads[0].id;
      // Update name and email if they changed
      const { error: updateError } = await supabase
        .from("leads")
        .update({ name, email })
        .eq("id", leadId);
      
      if (updateError) {
        console.error("Failed to update lead details:", updateError);
      }
    } else {
      // Create new lead
      const { data: newLead, error: insertError } = await supabase
        .from("leads")
        .insert({
          name,
          phone,
          email,
          source: "ai_chat",
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }
      leadId = newLead.id;
    }

    // 2. Find or create a chat session for this lead
    const { data: existingSessions, error: sessionFetchError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (sessionFetchError) {
      throw sessionFetchError;
    }

    let sessionId = "";

    if (existingSessions && existingSessions.length > 0) {
      sessionId = existingSessions[0].id;
    } else {
      // Create new session
      const { data: newSession, error: sessionInsertError } = await supabase
        .from("chat_sessions")
        .insert({
          lead_id: leadId,
          free_messages_used: 0,
        })
        .select("id")
        .single();

      if (sessionInsertError) {
        throw sessionInsertError;
      }
      sessionId = newSession.id;
    }

    return NextResponse.json({ leadId, sessionId });
  } catch (err: any) {
    console.error("Link lead error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
