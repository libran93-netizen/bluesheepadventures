import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // 1. Get authenticated user from Supabase session
    // Since service-role client is used, we must retrieve the user using the auth token in headers.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { providerId, useCredit, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    // 2. Check if already unlocked (Idempotent check)
    const { data: existingUnlock } = await supabase
      .from("unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (existingUnlock) {
      // Get the provider's phone number
      const { data: provider } = await supabase
        .from("providers")
        .select("phone")
        .eq("id", providerId)
        .single();

      return NextResponse.json({
        success: true,
        phone: provider?.phone,
        message: "Already unlocked previously",
      });
    }

    // 3. Option A: Unlock using Premium Credit
    if (useCredit) {
      // Fetch subscription credits
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("unlock_credits")
        .eq("user_id", user.id)
        .single();

      if (subError || !sub || sub.unlock_credits <= 0) {
        return NextResponse.json({ error: "Insufficient unlock credits" }, { status: 400 });
      }

      // Decrement credits atomatically
      const { error: decrementError } = await supabase
        .from("subscriptions")
        .update({ unlock_credits: sub.unlock_credits - 1 })
        .eq("user_id", user.id);

      if (decrementError) {
        throw decrementError;
      }

      // Insert unlock
      const { error: unlockInsertError } = await supabase
        .from("unlocks")
        .insert({
          user_id: user.id,
          provider_id: providerId,
          source: "premium_credit",
        });

      if (unlockInsertError) {
        throw unlockInsertError;
      }

      // Retrieve provider number
      const { data: provider } = await supabase
        .from("providers")
        .select("phone")
        .eq("id", providerId)
        .single();

      return NextResponse.json({
        success: true,
        phone: provider?.phone,
        message: "Unlock successful using premium credit",
      });
    }

    // 4. Option B: Unlock using one-time ₹499 Razorpay Payment
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Verify signature
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json({ error: "Razorpay credentials not configured on server" }, { status: 500 });
      }

      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
      }

      // Save/update payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .upsert({
          user_id: user.id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          amount: 49900, // ₹499 in paise
          type: "single_unlock",
          status: "paid",
        });

      if (paymentError) {
        console.error("Failed to store payment details:", paymentError);
      }

      // Fetch payment row id
      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      // Insert unlock record
      const { error: unlockInsertError } = await supabase
        .from("unlocks")
        .insert({
          user_id: user.id,
          provider_id: providerId,
          payment_id: payment?.id,
          source: "single",
        });

      if (unlockInsertError) {
        throw unlockInsertError;
      }

      // Retrieve phone number
      const { data: provider } = await supabase
        .from("providers")
        .select("phone")
        .eq("id", providerId)
        .single();

      return NextResponse.json({
        success: true,
        phone: provider?.phone,
        message: "Unlock successful via verification",
      });
    }

    return NextResponse.json({ error: "Unlock credentials or credits required" }, { status: 402 });
  } catch (err: any) {
    console.error("Unlock error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
