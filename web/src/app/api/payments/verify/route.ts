// Client-side checkout success callback: verifies the Razorpay signature
// (HMAC-SHA256 of "order_id|payment_id" with the key secret), marks the
// payment paid, and provisions premium. The webhook does the same server-to-
// server as a safety net — both paths are idempotent.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { userIdForSession } from "@/lib/account";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();
    if (!sessionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: "Gateway not configured" }, { status: 503 });

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expected !== razorpaySignature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const { userId } = await userIdForSession(sessionId);
    const db = createServerClient();

    // The payments row must exist, belong to this user, and match the order
    const { data: payment } = await db
      .from("payments")
      .select("id,type,status,user_id")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    if (!payment || payment.user_id !== userId) {
      return NextResponse.json({ error: "Unknown order" }, { status: 400 });
    }

    if (payment.status !== "paid") {
      await db
        .from("payments")
        .update({ razorpay_payment_id: razorpayPaymentId, status: "paid" })
        .eq("id", payment.id);

      if (payment.type === "premium") {
        const { data: existing } = await db
          .from("subscriptions").select("unlock_credits").eq("user_id", userId).maybeSingle();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        await db.from("subscriptions").upsert({
          user_id: userId,
          unlock_credits: (existing?.unlock_credits ?? 0) + 5,
          ai_unlimited: true,
          itinerary_editing: true,
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, type: payment.type });
  } catch (err) {
    console.error("[verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
