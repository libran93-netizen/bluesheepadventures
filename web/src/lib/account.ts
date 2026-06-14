// Login-at-payment without Google one-tap (yet): when a lead pays, we create
// a "shadow" Supabase auth user from the lead's email and link it to the lead.
// When Google one-tap lands, the same email resolves to the same user, so
// purchases made now survive the login upgrade (CLAUDE.md §7.5).

import { createServerClient } from "@/lib/supabase";

/**
 * Resolve a chat session to an auth user id, creating the shadow user and
 * linking the lead on first payment. Throws if the session/lead is unknown.
 */
export async function userIdForSession(sessionId: string): Promise<{
  userId: string;
  leadId: string;
  email: string;
  name: string;
}> {
  const db = createServerClient();

  const { data: session } = await db
    .from("chat_sessions").select("lead_id").eq("id", sessionId).maybeSingle();
  if (!session) throw new Error("session not found");

  const { data: lead } = await db
    .from("leads").select("id,name,email,user_id").eq("id", session.lead_id).maybeSingle();
  if (!lead) throw new Error("lead not found");

  if (lead.user_id) {
    return { userId: lead.user_id, leadId: lead.id, email: lead.email, name: lead.name };
  }

  // Find an existing auth user with this email (e.g. created via a previous
  // session), else create a confirmed shadow user.
  let userId: string | undefined;
  const { data: created, error: createErr } = await db.auth.admin.createUser({
    email: lead.email,
    email_confirm: true,
    user_metadata: { shadow: true, lead_id: lead.id, name: lead.name },
  });
  if (createErr) {
    // Likely "already registered" — look the user up by email
    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list?.users.find((u) => u.email?.toLowerCase() === lead.email.toLowerCase())?.id;
    if (!userId) throw createErr;
  } else {
    userId = created.user.id;
  }

  await db.from("leads").update({ user_id: userId }).eq("id", lead.id);
  return { userId, leadId: lead.id, email: lead.email, name: lead.name };
}
