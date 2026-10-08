import { db } from "@/lib/db";
import { setStudent } from "@/lib/auth";
import { body, cleanUsername, fail, ok, validUsername } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body<{ code: string; username: string }>(req);
  const code = typeof b.code === "string" ? b.code.trim().toUpperCase() : "";
  const username = cleanUsername(b.username);
  if (!code) return fail("Skriv holdkoden.");
  if (!validUsername(username)) return fail("Brugernavnet skal være 2 til 24 tegn. Brug bogstaver, tal og mellemrum.");

  const { data: session, error } = await db().from("sessions").select("id,status").eq("code", code).maybeSingle();
  if (error) return fail("Databasen svarer ikke lige nu. Prøv igen.", 500);
  if (!session) return fail("Holdkoden findes ikke. Tjek, at den er skrevet rigtigt.", 404);
  if (session.status !== "open") return fail("Holdet er lukket for nye afleveringer.", 403);

  let { data: p } = await db().from("participants").select("id").eq("session_id", session.id).eq("username", username).maybeSingle();
  if (!p) {
    const ins = await db().from("participants").insert({ session_id: session.id, username }).select("id").single();
    if (ins.error) {
      // Samtidig oprettelse med samme navn. Hent den eksisterende.
      const again = await db().from("participants").select("id").eq("session_id", session.id).eq("username", username).maybeSingle();
      if (!again.data) return fail("Kunne ikke logge ind. Prøv igen.", 500);
      p = again.data;
    } else p = ins.data;
  }
  await setStudent(p.id, session.id);
  return ok({ ok: true });
}
