import { db } from "@/lib/db";
import { getStudent } from "@/lib/auth";
import { body, fail, ok } from "@/lib/http";

type Answers = { fejl1?: string; fejl2?: string; fejl3?: string; tjek?: string };
const clip = (v: unknown) => (typeof v === "string" ? v.slice(0, 1500) : "");

export async function GET() {
  const me = await getStudent();
  if (!me) return fail("Ikke logget ind.", 401);
  const { data } = await db().from("submissions").select("answers,submitted_at,updated_at").eq("participant_id", me.participantId).eq("kind", "find_fejlen").maybeSingle();
  return ok(data ?? { answers: {}, submitted_at: null });
}

export async function PUT(req: Request) {
  const me = await getStudent();
  if (!me) return fail("Ikke logget ind.", 401);
  const { data: s } = await db().from("sessions").select("status").eq("id", me.sessionId).maybeSingle();
  if (!s) return fail("Holdet findes ikke længere.", 404);
  if (s.status !== "open") return fail("Holdet er lukket, så svaret kan ikke gemmes.", 403);

  const b = await body<{ answers: Answers; submit: boolean }>(req);
  const a = b.answers ?? {};
  const answers = { fejl1: clip(a.fejl1), fejl2: clip(a.fejl2), fejl3: clip(a.fejl3), tjek: clip(a.tjek) };
  const row: Record<string, unknown> = {
    session_id: me.sessionId, participant_id: me.participantId, kind: "find_fejlen", answers, updated_at: new Date().toISOString(),
  };
  if (b.submit) row.submitted_at = new Date().toISOString();
  const { data, error } = await db().from("submissions").upsert(row, { onConflict: "participant_id,kind" }).select("submitted_at,updated_at").single();
  if (error) return fail("Svaret blev ikke gemt. Prøv igen.", 500);
  return ok(data);
}
