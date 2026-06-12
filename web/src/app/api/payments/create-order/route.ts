// Creates a Razorpay order for ₹499 (single_unlock) or ₹1,499 (premium).
// Identity comes from the chat session (shadow auth user created at first
// payment — see lib/account.ts). Returns checkout params for Razorpay JS.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { userIdForSession } from "@/lib/account";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

const PRICES = { single_unlock: 49900, premium: 149900 } as const; // paise

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { type?: string; sessionId?: string };
    const { sessionId } = body;
    const type = body.type as keyof typeof PRICES;

    if (type !== "single_unlock" && type !== "premium") {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required — start a chat so we can attach your purchase" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.includes("your")) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const { userId, email, name } = await userIdForSession(sessionId);
    const amount = PRICES[type];

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `bsa_${Date.now()}`,
      notes: { type, sessionId },
    });

    const db = createServerClient();
    const { error } = await db.from("payments").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount,
      type,
      status: "created",
    });
    if (error) throw error;

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId,
      prefill: { email, name },
    });
  } catch (err) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
