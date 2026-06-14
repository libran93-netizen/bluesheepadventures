import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    const { providerId } = await req.json();

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    // 2. Verify that the unlock exists for this user and provider
    const { data: existingUnlock, error: fetchError } = await supabase
      .from("unlocks")
      .select("id, created_at, response_reported")
      .eq("user_id", user.id)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (fetchError || !existingUnlock) {
      return NextResponse.json(
        { error: "No unlock record found for this provider" },
        { status: 404 }
      );
    }

    if (existingUnlock.response_reported) {
      return NextResponse.json(
        { message: "This provider has already been reported for this unlock" },
        { status: 400 }
      );
    }

    // 3. Mark the unlock as reported
    const { error: updateError } = await supabase
      .from("unlocks")
      .update({
        response_reported: true,
      })
      .eq("id", existingUnlock.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Provider reported successfully. Our team will review and resolve this within 48 hours.",
    });
  } catch (err: any) {
    console.error("Report provider error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
