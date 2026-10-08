import { db } from "@/lib/db";
import { isTeacher } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { id } = await params;
  const { data, error } = await db().from("questions").select("id,username,body,status,created_at").eq("session_id", id).order("created_at");
  if (error) return fail("Databasen svarer ikke.", 500);
  return ok(data ?? []);
}
