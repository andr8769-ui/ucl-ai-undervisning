import { notFound, redirect } from "next/navigation";
import { isTeacher } from "@/lib/auth";
import { db, SessionRow } from "@/lib/db";
import { PROGRAMMES } from "@/lib/programmes";
import { joinInfo } from "@/lib/join";
import { slideCount } from "@/lib/deck";
import Presenter from "@/components/Presenter";

export const dynamic = "force-dynamic";

export default async function PresenterPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isTeacher())) redirect("/laerer");
  const { id } = await params;
  const { data } = await db().from("sessions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const s = data as SessionRow;
  const prog = PROGRAMMES[s.programme];
  const [join, count] = await Promise.all([joinInfo(s.code), slideCount(s.programme)]);
  return (
    <div style={{ ["--accent" as string]: prog.accent }}>
      <Presenter sessionId={s.id} progKey={prog.key} count={count} code={s.code} host={join.host} qrSvg={join.qrSvg} />
    </div>
  );
}
