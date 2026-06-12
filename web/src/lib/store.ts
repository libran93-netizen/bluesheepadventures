// Storage layer for the chat/lead/metering flow.
//
// Two drivers behind one interface:
//   - SupabaseStore: production path (service-role client, RLS bypass)
//   - LocalStore:    dev fallback (web/.data/dev-store.json) so the full
//     flow runs before Supabase credentials exist. Same semantics.
//
// The driver is picked once per process from env: real-looking Supabase
// keys → SupabaseStore, otherwise LocalStore (with a one-time warning).

import { createServerClient } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  user_id: string | null;
}

export interface ChatSession {
  id: string;
  lead_id: string;
  free_messages_used: number;
}

export interface ItineraryRecord {
  source: "karan_seed" | "ai_generated";
  trek: string;
  region: string;
  content: unknown;
  lead_id: string;
}

export interface Store {
  /** Insert lead or return the existing one with the same phone (metering dedupe). */
  upsertLeadByPhone(input: { name: string; phone: string; email: string; source?: string }): Promise<Lead>;
  createSession(leadId: string): Promise<ChatSession>;
  getSession(sessionId: string): Promise<ChatSession | null>;
  /** Total counted messages across ALL sessions of this lead (meter survives new sessions). */
  countedMessagesForLead(leadId: string): Promise<number>;
  incrementMeter(sessionId: string): Promise<void>;
  saveMessage(sessionId: string, role: "user" | "assistant", content: string, countsAgainstFree: boolean): Promise<void>;
  getSessionMessages(sessionId: string): Promise<{ role: "user" | "assistant"; content: string }[]>;
  saveItinerary(rec: ItineraryRecord): Promise<string>;
  /** ai_unlimited premium check via lead → user → subscription. */
  isPremiumLead(leadId: string): Promise<boolean>;
  /** Count of verified providers covering a region (teaser numbers — never phones). */
  verifiedProviderCount(region: string): Promise<number>;
  /** RAG: nearest itinerary chunks for a query embedding ([] when unavailable). */
  matchChunks(queryEmbedding: number[], threshold?: number, count?: number): Promise<string[]>;
}

// ─── Supabase driver ────────────────────────────────────────────────────

class SupabaseStore implements Store {
  private db = createServerClient();

  async upsertLeadByPhone(input: { name: string; phone: string; email: string; source?: string }): Promise<Lead> {
    const { data: existing } = await this.db
      .from("leads").select("id,name,phone,email,user_id").eq("phone", input.phone).maybeSingle();
    if (existing) return existing as Lead;

    const { data, error } = await this.db
      .from("leads")
      .insert({ name: input.name, phone: input.phone, email: input.email, source: input.source ?? "ai_chat" })
      .select("id,name,phone,email,user_id")
      .single();
    if (error) throw error;
    return data as Lead;
  }

  async createSession(leadId: string): Promise<ChatSession> {
    const { data, error } = await this.db
      .from("chat_sessions").insert({ lead_id: leadId })
      .select("id,lead_id,free_messages_used").single();
    if (error) throw error;
    return data as ChatSession;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const { data } = await this.db
      .from("chat_sessions").select("id,lead_id,free_messages_used").eq("id", sessionId).maybeSingle();
    return (data as ChatSession) ?? null;
  }

  async countedMessagesForLead(leadId: string): Promise<number> {
    const { data } = await this.db
      .from("chat_sessions").select("free_messages_used").eq("lead_id", leadId);
    return (data ?? []).reduce((sum, s) => sum + (s.free_messages_used ?? 0), 0);
  }

  async incrementMeter(sessionId: string): Promise<void> {
    // Read-then-write (no RPC needed; per-session row, low contention)
    const session = await this.getSession(sessionId);
    if (!session) return;
    await this.db
      .from("chat_sessions")
      .update({ free_messages_used: session.free_messages_used + 1 })
      .eq("id", sessionId);
  }

  async saveMessage(sessionId: string, role: "user" | "assistant", content: string, countsAgainstFree: boolean) {
    await this.db.from("chat_messages").insert({ session_id: sessionId, role, content, counts_against_free: countsAgainstFree });
  }

  async getSessionMessages(sessionId: string) {
    const { data } = await this.db
      .from("chat_messages").select("role,content").eq("session_id", sessionId).order("id", { ascending: true });
    return (data ?? []).filter((m) => m.role !== "system") as { role: "user" | "assistant"; content: string }[];
  }

  async saveItinerary(rec: ItineraryRecord): Promise<string> {
    const { data, error } = await this.db.from("itineraries").insert(rec).select("id").single();
    if (error) throw error;
    return data.id as string;
  }

  async isPremiumLead(leadId: string): Promise<boolean> {
    const { data: lead } = await this.db.from("leads").select("user_id").eq("id", leadId).maybeSingle();
    if (!lead?.user_id) return false;
    const { data: sub } = await this.db
      .from("subscriptions").select("ai_unlimited,expires_at").eq("user_id", lead.user_id).maybeSingle();
    if (!sub?.ai_unlimited) return false;
    return !sub.expires_at || new Date(sub.expires_at).getTime() > Date.now();
  }

  async verifiedProviderCount(region: string): Promise<number> {
    const { count } = await this.db
      .from("providers_public")
      .select("id", { count: "exact", head: true })
      .contains("regions", [region]);
    return count ?? 0;
  }

  async matchChunks(queryEmbedding: number[], threshold = 0.3, count = 4): Promise<string[]> {
    const { data, error } = await this.db.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: count,
    });
    if (error || !data) return [];
    return data.map((c: { chunk_text: string }) => c.chunk_text);
  }
}

// ─── Local dev driver (file-backed) ─────────────────────────────────────

interface LocalData {
  leads: (Lead & { source: string; created_at: string })[];
  sessions: (ChatSession & { created_at: string })[];
  messages: { session_id: string; role: string; content: string; counts_against_free: boolean; created_at: string }[];
  itineraries: (ItineraryRecord & { id: string; created_at: string })[];
}

const LOCAL_FILE = path.join(process.cwd(), ".data", "dev-store.json");

class LocalStore implements Store {
  private data: LocalData;

  constructor() {
    if (existsSync(LOCAL_FILE)) {
      this.data = JSON.parse(readFileSync(LOCAL_FILE, "utf8"));
    } else {
      this.data = { leads: [], sessions: [], messages: [], itineraries: [] };
    }
  }

  private persist() {
    mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(this.data, null, 2));
  }

  async upsertLeadByPhone(input: { name: string; phone: string; email: string; source?: string }): Promise<Lead> {
    const existing = this.data.leads.find((l) => l.phone === input.phone);
    if (existing) return existing;
    const lead = {
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      email: input.email,
      user_id: null,
      source: input.source ?? "ai_chat",
      created_at: new Date().toISOString(),
    };
    this.data.leads.push(lead);
    this.persist();
    return lead;
  }

  async createSession(leadId: string): Promise<ChatSession> {
    const session = { id: randomUUID(), lead_id: leadId, free_messages_used: 0, created_at: new Date().toISOString() };
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.data.sessions.find((s) => s.id === sessionId) ?? null;
  }

  async countedMessagesForLead(leadId: string): Promise<number> {
    return this.data.sessions
      .filter((s) => s.lead_id === leadId)
      .reduce((sum, s) => sum + s.free_messages_used, 0);
  }

  async incrementMeter(sessionId: string): Promise<void> {
    const s = this.data.sessions.find((x) => x.id === sessionId);
    if (s) {
      s.free_messages_used += 1;
      this.persist();
    }
  }

  async saveMessage(sessionId: string, role: "user" | "assistant", content: string, countsAgainstFree: boolean) {
    this.data.messages.push({
      session_id: sessionId, role, content,
      counts_against_free: countsAgainstFree, created_at: new Date().toISOString(),
    });
    this.persist();
  }

  async getSessionMessages(sessionId: string) {
    return this.data.messages
      .filter((m) => m.session_id === sessionId)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  }

  async saveItinerary(rec: ItineraryRecord): Promise<string> {
    const id = randomUUID();
    this.data.itineraries.push({ ...rec, id, created_at: new Date().toISOString() });
    this.persist();
    return id;
  }

  async isPremiumLead(): Promise<boolean> {
    return false; // no auth/subscriptions in local dev mode
  }

  async verifiedProviderCount(): Promise<number> {
    return 0; // teaser falls back to config counts in the route
  }

  async matchChunks(): Promise<string[]> {
    return []; // no pgvector locally — route handles empty grounding context
  }
}

// ─── Driver selection ───────────────────────────────────────────────────

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return (
    url.startsWith("https://") &&
    url.includes(".supabase.co") &&
    !url.includes("your-") &&
    key.length > 20 &&
    !key.includes("your-")
  );
}

let _store: Store | undefined;
export function store(): Store {
  if (!_store) {
    if (supabaseConfigured()) {
      _store = new SupabaseStore();
    } else {
      console.warn("[store] Supabase env not configured — using local dev store at .data/dev-store.json");
      _store = new LocalStore();
    }
  }
  return _store;
}
