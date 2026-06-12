import fs from "fs";
import path from "path";
import * as pdfParse from "pdf-parse";
const parsePdf = (pdfParse as any).default || pdfParse;
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { loadEnvConfig } from "@next/env";

// ─── Load Environment Variables ──────────────────────────────────────────
// Next.js helper to load environment variables from .env and .env.local
const projectDir = path.resolve(process.cwd());
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined.");
  process.exit(1);
}

if (!nvidiaApiKey) {
  console.warn("Warning: NVIDIA_API_KEY is not defined. Script will run in mock mode (zero vectors).");
}

// ─── Initialize Clients ──────────────────────────────────────────────────
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const aiClient = nvidiaApiKey
  ? new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: nvidiaApiKey,
    })
  : null;

// ─── Region Mapping ──────────────────────────────────────────────────────
const mapFileToRegion = (filename: string): string => {
  const fileLower = filename.toLowerCase();
  
  // Kashmir keywords
  if (fileLower.includes("kgl") || fileLower.includes("kashmir") || fileLower.includes("tarsar") || fileLower.includes("marsar")) {
    return "kashmir";
  }
  // Nepal keywords
  if (
    fileLower.includes("ebc") || 
    fileLower.includes("everest") || 
    fileLower.includes("annapurna") || 
    fileLower.includes("abc") || 
    fileLower.includes("khopra") || 
    fileLower.includes("sandakphu") || 
    fileLower.includes("langtang")
  ) {
    return "nepal";
  }
  // Uttarakhand keywords
  if (
    fileLower.includes("brahmatal") || 
    fileLower.includes("dayara") || 
    fileLower.includes("gomukh") || 
    fileLower.includes("har ki dun") || 
    fileLower.includes("kedarnath") || 
    fileLower.includes("pangarchulla") || 
    fileLower.includes("roopkund") || 
    fileLower.includes("rupin")
  ) {
    return "uttarakhand";
  }
  // Himachal keywords
  if (
    fileLower.includes("beas") || 
    fileLower.includes("bhrigu") || 
    fileLower.includes("buran") || 
    fileLower.includes("friendship") || 
    fileLower.includes("pin parvati") || 
    fileLower.includes("yunam") || 
    fileLower.includes("triund")
  ) {
    return "himachal";
  }

  // Default fallback
  return "himachal";
};

const cleanTrekName = (filename: string): string => {
  // Remove extension and common suffixes
  let name = filename.replace(/\.[^/.]+$/, "");
  name = name.replace(/_compressed|_itinerary|_Detailed_Itinerary|Detailed_Itinerary|_Final|Trek|Travel/gi, "");
  name = name.replace(/[-_]/g, " ").trim();
  
  // Title case formatting
  return name.split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// ─── Text Chunker (for RAG embedding size constraints) ───────────────────
const chunkText = (text: string, maxChunkSize: number = 1800): string[] => {
  const cleanedText = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  const paragraphs = cleanedText.split("\n\n");
  
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    if (currentChunk.length + trimmed.length + 2 > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      if (trimmed.length > maxChunkSize) {
        // Fallback: Split by sentences if paragraph is huge
        const sentences = trimmed.split(/(?<=[.!?])\s+/);
        currentChunk = "";
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 1 > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
          } else {
            currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
          }
        }
      } else {
        currentChunk = trimmed;
      }
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + trimmed : trimmed;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// ─── Ingestion Flow ──────────────────────────────────────────────────────
async function run() {
  console.log("Starting RAG Itinerary Ingestion Script...");
  
  // The itineraries directory is in the project root
  const itinerariesDir = path.join(projectDir, "../BSA Itineraries");
  
  if (!fs.existsSync(itinerariesDir)) {
    console.error(`Error: Itineraries directory not found at: ${itinerariesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(itinerariesDir).filter((file) => file.toLowerCase().endsWith(".pdf"));
  console.log(`Found ${files.length} PDF files for processing.`);

  let totalChunksIngested = 0;

  for (const file of files) {
    const filePath = path.join(itinerariesDir, file);
    const trekName = cleanTrekName(file);
    const regionName = mapFileToRegion(file);
    
    console.log(`\nProcessing: "${file}" -> Trek: "${trekName}", Region: "${regionName}"`);

    try {
      // 1. Read and parse PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const parsedData = await parsePdf(pdfBuffer);
      const fullText = parsedData.text;

      if (!fullText || fullText.trim().length === 0) {
        console.warn(`Warning: Extracted text is empty for ${file}. Skipping.`);
        continue;
      }

      // 2. Insert into itineraries table
      const { data: itinerary, error: itineraryError } = await supabase
        .from("itineraries")
        .insert({
          source: "karan_seed",
          trek: trekName,
          region: regionName,
          content: { rawText: fullText },
          editable: false
        })
        .select("id")
        .single();

      if (itineraryError || !itinerary) {
        console.error(`Error inserting itinerary record for ${file}:`, itineraryError);
        continue;
      }

      // 3. Chunk text
      const chunks = chunkText(fullText);
      console.log(`Split text into ${chunks.length} chunks.`);

      // 4. Generate embeddings and insert chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let embeddingVector = new Array(1024).fill(0); // mock embedding placeholder

        if (aiClient) {
          try {
            const embedRes = await aiClient.embeddings.create({
              model: "nvidia/nv-embedqa-e5-v5",
              input: chunk,
              encoding_format: "float",
              extra_body: { input_type: "passage" },
            } as any);
            
            embeddingVector = embedRes.data[0].embedding;
          } catch (embedErr) {
            console.error(`Failed to generate embedding for chunk ${i} of ${file}:`, embedErr);
            // Continue with zero vector as fallback to avoid crashing script
          }
        }

        const { error: chunkError } = await supabase
          .from("itinerary_chunks")
          .insert({
            itinerary_id: itinerary.id,
            chunk_text: chunk,
            embedding: embeddingVector
          });

        if (chunkError) {
          console.error(`Error inserting chunk ${i} of ${file}:`, chunkError);
        } else {
          totalChunksIngested++;
        }
      }

      console.log(`Successfully ingested ${file}.`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }

  console.log(`\nIngestion complete! Total chunks ingested: ${totalChunksIngested}`);
}

run();
