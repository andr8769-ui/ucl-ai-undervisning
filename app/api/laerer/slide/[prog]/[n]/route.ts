import { isTeacher } from "@/lib/auth";
import { fail } from "@/lib/http";
import { isProg } from "@/lib/programmes";
import { readPrivate } from "@/lib/private-files";

type Ctx = { params: Promise<{ prog: string; n: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { prog, n } = await params;
  const num = Number(n);
  if (!isProg(prog) || !Number.isInteger(num) || num < 1 || num > 99) return fail("Ukendt slide.", 404);
  try {
    const buf = await readPrivate(prog, "slides", `${String(num).padStart(2, "0")}.jpg`);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" } });
  } catch {
    return fail("Ukendt slide.", 404);
  }
}
