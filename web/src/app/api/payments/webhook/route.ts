import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Signature is MANDATORY whenever a secret is configured; in production a
    // missing secret refuses the webhook outright.
    if (webhookSecret && !webhookSecret.includes("your")) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");
      if (!signature || expectedSignature !== signature) {
        return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const eventData = JSON.parse(bodyText);
    const event = eventData.event;

    if (event === "order.paid") {
      const orderId = eventData.payload.payment.entity.order_id;
      const paymentId = eventData.payload.payment.entity.id;
      
      const supabase = createServerClient();

      // 1. Fetch current payment details
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!payment) {
        console.warn(`Payment record for order ${orderId} not found in database.`);
        return NextResponse.json({ success: true, message: "Order not logged in DB" });
      }

      // 2. Mark payment as paid
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          razorpay_payment_id: paymentId,
          status: "paid",
        })
        .eq("id", payment.id);

      if (updateError) {
        throw updateError;
      }

      // 3. Provision Premium Subscriptions
      if (payment.type === "premium") {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 Year premium duration

        // Check if subscription already exists
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", payment.user_id)
          .maybeSingle();

        const currentCredits = existingSub?.unlock_credits || 0;

        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: payment.user_id,
            unlock_credits: currentCredits + 5, // grant 5 credits
            ai_unlimited: true,
            itinerary_editing: true,
            expires_at: expiresAt.toISOString(),
          });

        if (subError) {
          console.error("Failed to provision subscription details:", subError);
          throw subError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
