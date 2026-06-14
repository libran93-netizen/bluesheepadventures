// Unlock flow (CLAUDE.md §7.4) — server-side, atomic, idempotent.
//
//   POST { providerId, sessionId }
//     → resolve user from session (shadow user created at payment)
//     → existing unlock?            return phone (no charge)
//     → spend_unlock_credit() RPC?  unlock(source=premium_credit) → phone
//     → unconsumed PAID ₹499 order? unlock(source=single) → phone
//     → else 402 (client opens checkout, then retries after verify)
//
// The phone number leaves the server ONLY through this response.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { userIdForSession } from "@/lib/account";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { providerId, sessionId } = await req.json();
    if (!providerId || !sessionId) {
      return NextResponse.json({ error: "providerId and sessionId required" }, { status: 400 });
    }

    const db = createServerClient();
    const { userId } = await userIdForSession(sessionId);

    const { data: provider } = await db
      .from("providers")
      .select("id,name,phone,status")
      .eq("id", providerId)
      .maybeSingle();
    if (!provider || provider.status !== "verified") {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const reveal = (source: string) =>
      NextResponse.json({
        success: true,
        source,
        provider: { id: provider.id, name: provider.name, phone: provider.phone },
      });

    // 1. Idempotent: already unlocked → return phone, never charge twice
    const { data: existing } = await db
      .from("unlocks")
      .select("id,source")
      .eq("user_id", userId)
      .eq("provider_id", providerId)
      .maybeSingle();
    if (existing) return reveal(existing.source);

    // 2. Premium credit — atomic decrement-with-check in Postgres
    const { data: creditTaken } = await db.rpc("spend_unlock_credit", { p_user_id: userId });
    if (creditTaken === true) {
      const { error } = await db
        .from("unlocks")
        .insert({ user_id: userId, provider_id: providerId, source: "premium_credit" });
      if (error) throw error;
      return reveal("premium_credit");
    }

    // 3. Unconsumed paid ₹499 order
    const { data: paidOrders } = await db
      .from("payments")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "single_unlock")
      .eq("status", "paid");
    if (paidOrders && paidOrders.length > 0) {
      const { data: consumed } = await db
        .from("unlocks")
        .select("payment_id")
        .eq("user_id", userId)
        .not("payment_id", "is", null);
      const used = new Set((consumed ?? []).map((u) => u.payment_id));
      const fresh = paidOrders.find((p) => !used.has(p.id));
      if (fresh) {
        const { error } = await db.from("unlocks").insert({
          user_id: userId,
          provider_id: providerId,
          payment_id: fresh.id,
          source: "single",
        });
        if (error) throw error;
        return reveal("single");
      }
    }

    // 4. Nothing to spend → paywall
    return NextResponse.json(
      { paywall: true, error: "No credits or paid order — purchase required" },
      { status: 402 }
    );
  } catch (err) {
    console.error("[unlock]", err);
    return NextResponse.json({ error: "Unlock failed" }, { status: 500 });
  }
}
