import { checkTeacherCode, clearTeacher, setTeacher } from "@/lib/auth";
import { body, fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body<{ code: string }>(req);
  await new Promise((r) => setTimeout(r, 400)); // bremser gætteri
  if (typeof b.code !== "string" || !checkTeacherCode(b.code)) return fail("Forkert lærerkode.", 401);
  await setTeacher();
  return ok();
}

export async function DELETE() {
  await clearTeacher();
  return ok();
}
