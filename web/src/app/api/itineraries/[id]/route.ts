import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ─── GET /api/itineraries/[id] ──────────────────────────────────────────
// Retrieve a specific itinerary by ID.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Itinerary ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: itinerary, error } = await supabase
      .from("itineraries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (err: any) {
    console.error("GET itinerary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/itineraries/[id] ────────────────────────────────────────
// Update an existing itinerary (Premium/Subscription only).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Itinerary ID is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Retrieve the itinerary and check ownership
    const { data: itinerary, error: fetchError } = await supabase
      .from("itineraries")
      .select("user_id, lead_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    let isOwner = itinerary.user_id === user.id;
    if (!isOwner && itinerary.lead_id) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", itinerary.lead_id)
        .maybeSingle();
      if (lead) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized access to itinerary" }, { status: 403 });
    }

    // 3. Verify user's premium/editing subscription
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("itinerary_editing, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const isExpired = sub?.expires_at 
      ? new Date(sub.expires_at).getTime() < Date.now()
      : true;

    if (subError || !sub || !sub.itinerary_editing || isExpired) {
      return NextResponse.json(
        { error: "Premium subscription required to edit itineraries" },
        { status: 403 }
      );
    }

    // 4. Update the itinerary content
    const { content, trek, region } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required for updates" }, { status: 400 });
    }

    const { data: updatedItinerary, error: updateError } = await supabase
      .from("itineraries")
      .update({
        content,
        ...(trek && { trek }),
        ...(region && { region }),
        editable: true,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      itinerary: updatedItinerary,
      message: "Itinerary updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH itinerary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
