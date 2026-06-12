import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import Razorpay from "razorpay";

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

    const { type } = await req.json();

    if (!type || (type !== "single_unlock" && type !== "premium")) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    const amount = type === "premium" ? 149900 : 49900; // In paise (₹1,499 or ₹499)

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = "";
    let mockPayment = false;

    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        });

        orderId = order.id;
      } catch (rzpErr: any) {
        console.error("Razorpay order creation failed:", rzpErr);
        return NextResponse.json({ error: "Payment gateway integration failed" }, { status: 500 });
      }
    } else {
      console.warn("Razorpay API keys not defined. Generating mock order ID.");
      orderId = `order_mock_${Math.random().toString(36).substring(7)}`;
      mockPayment = true;
    }

    // 2. Log payment attempt in database
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        razorpay_order_id: orderId,
        amount,
        type,
        status: "created",
      });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency: "INR",
      mock: mockPayment,
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
