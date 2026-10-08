import { db } from "@/lib/db";
import { isTeacher } from "@/lib/auth";
import { body, fail, ok } from "@/lib/http";

type Ctx = { params: Promise<{ qid: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { qid } = await params;
  const b = await body<{ status: string }>(req);
  if (!["new", "shown", "done"].includes(String(b.status))) return fail("Ugyldig status.");
  const { error } = await db().from("questions").update({ status: b.status }).eq("id", qid);
  if (error) return fail("Kunne ikke opdatere.", 500);
  return ok();
}
