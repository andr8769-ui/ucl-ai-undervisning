import { isTeacher } from "@/lib/auth";
import { fail } from "@/lib/http";
import { isProg } from "@/lib/programmes";
import { readPrivate } from "@/lib/private-files";

type Ctx = { params: Promise<{ prog: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { prog } = await params;
  if (!isProg(prog)) return fail("Ukendt uddannelse.", 404);
  const buf = await readPrivate(prog, "notes.json");
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, max-age=3600" } });
}
