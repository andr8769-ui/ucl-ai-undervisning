import { db } from "@/lib/db";
import { isTeacher } from "@/lib/auth";
import { body, fail, makeCode, ok } from "@/lib/http";
import { isProg } from "@/lib/programmes";

export async function GET() {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { data, error } = await db().from("sessions").select("*").order("session_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) return fail("Databasen svarer ikke.", 500);
  return ok(data);
}

export async function POST(req: Request) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const b = await body<{ programme: string; class_name: string; session_date: string }>(req);
  const programme = typeof b.programme === "string" ? b.programme : "";
  const class_name = typeof b.class_name === "string" ? b.class_name.trim().slice(0, 60) : "";
  const session_date = typeof b.session_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.session_date) ? b.session_date : "";
  if (!isProg(programme)) return fail("Vælg en uddannelse.");
  if (!class_name) return fail("Skriv holdets navn.");
  if (!session_date) return fail("Vælg en dato.");

  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const { data, error } = await db().from("sessions").insert({ code, programme, class_name, session_date }).select("*").single();
    if (!error) return ok(data);
    if (error.code !== "23505") return fail("Sessionen blev ikke oprettet.", 500);
  }
  return fail("Kunne ikke finde en ledig holdkode. Prøv igen.", 500);
}
