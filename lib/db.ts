import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Server-only klient. Nøglen og hemmeligheden når aldrig browseren.
// Databasens adgangsregler kræver headeren x-app-secret på hver forespørgsel.
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  const secret = process.env.APP_SECRET;
  if (!url || !key || !secret) throw new Error("Mangler SUPABASE_URL, SUPABASE_KEY eller APP_SECRET");
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-app-secret": secret } },
  });
  return client;
}

export type SessionRow = {
  id: string;
  code: string;
  programme: "proces" | "handel" | "service";
  class_name: string;
  session_date: string;
  status: "open" | "closed";
  created_at: string;
};
