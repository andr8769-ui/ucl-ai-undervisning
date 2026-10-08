import { db } from "@/lib/db";
import { isTeacher } from "@/lib/auth";
import { body, fail, ok } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { id } = await params;
  const [s, p, sub, q] = await Promise.all([
    db().from("sessions").select("*").eq("id", id).maybeSingle(),
    db().from("participants").select("id,username,created_at").eq("session_id", id).order("created_at"),
    db().from("submissions").select("participant_id,answers,submitted_at,updated_at").eq("session_id", id).eq("kind", "find_fejlen"),
    db().from("questions").select("id,username,body,status,created_at").eq("session_id", id).order("created_at"),
  ]);
  if (!s.data) return fail("Sessionen findes ikke.", 404);
  return ok({ session: s.data, participants: p.data ?? [], submissions: sub.data ?? [], questions: q.data ?? [] });
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { id } = await params;
  const b = await body<{ status: string }>(req);
  if (b.status !== "open" && b.status !== "closed") return fail("Ugyldig status.");
  const { data, error } = await db().from("sessions").update({ status: b.status }).eq("id", id).select("*").single();
  if (error) return fail("Kunne ikke opdatere.", 500);
  return ok(data);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { id } = await params;
  const { error } = await db().from("sessions").delete().eq("id", id);
  if (error) return fail("Kunne ikke slette.", 500);
  return ok();
}
