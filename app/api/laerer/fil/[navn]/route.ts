import { isTeacher } from "@/lib/auth";
import { fail } from "@/lib/http";
import { PROGRAMMES, isProg } from "@/lib/programmes";
import { readPrivate } from "@/lib/private-files";

type Ctx = { params: Promise<{ navn: string }> };

// /api/laerer/fil/plan  eller  /api/laerer/fil/proces (præsentationen)
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isTeacher())) return fail("Ikke logget ind.", 401);
  const { navn } = await params;
  if (navn === "plan") {
    const buf = await readPrivate("undervisningsplan.pdf");
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="Undervisningsplan med facit.pdf"' },
    });
  }
  if (isProg(navn)) {
    const buf = await readPrivate(navn, "praesentation.pptx");
    const fname = `Præsentation ${PROGRAMMES[navn].name}.pptx`;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="praesentation.pptx"; filename*=UTF-8''${encodeURIComponent(fname)}`,
      },
    });
  }
  return fail("Ukendt fil.", 404);
}
