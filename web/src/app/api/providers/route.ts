import { NextRequest, NextResponse } from "next/server";
import { createBrowserClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const trek = searchParams.get("trek");
    const type = searchParams.get("type");

    const supabase = createBrowserClient();
    
    // Query the providers_public view to enforce security: phone is never returned.
    let query = supabase.from("providers_public").select("*");

    if (region) {
      // In Postgres schema: regions is text[]
      query = query.contains("regions", [region]);
    }

    if (trek) {
      // In Postgres schema: treks is text[]
      query = query.contains("treks", [trek]);
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data: providers, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(providers);
  } catch (err: any) {
    console.error("Fetch providers error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
