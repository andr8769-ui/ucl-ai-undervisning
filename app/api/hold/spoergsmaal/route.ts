import { db } from "@/lib/db";
import { getStudent } from "@/lib/auth";
import { body, fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const me = await getStudent();
  if (!me) return fail("Ikke logget ind.", 401);
  const b = await body<{ text: string }>(req);
  const text = typeof b.text === "string" ? b.text.trim().slice(0, 500) : "";
  if (!text) return fail("Skriv dit spørgsmål.");

  const { data: p } = await db().from("participants").select("username").eq("id", me.participantId).maybeSingle();
  if (!p) return fail("Ikke logget ind.", 401);

  const since = new Date(Date.now() - 8000).toISOString();
  const recent = await db().from("questions").select("id", { count: "exact", head: true }).eq("participant_id", me.participantId).gte("created_at", since);
  if ((recent.count ?? 0) > 0) return fail("Vent et øjeblik, før du sender igen.", 429);

  const { error } = await db().from("questions").insert({ session_id: me.sessionId, participant_id: me.participantId, username: p.username, body: text });
  if (error) return fail("Spørgsmålet blev ikke sendt. Prøv igen.", 500);
  return ok();
}
