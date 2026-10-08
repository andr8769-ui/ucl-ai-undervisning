import { notFound, redirect } from "next/navigation";
import { isTeacher } from "@/lib/auth";
import { db, SessionRow } from "@/lib/db";
import { FACIT } from "@/lib/facit";
import { PROGRAMMES } from "@/lib/programmes";
import { joinInfo } from "@/lib/join";
import SessionLive from "@/components/SessionLive";

export const dynamic = "force-dynamic";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isTeacher())) redirect("/laerer");
  const { id } = await params;
  const { data } = await db().from("sessions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const s = data as SessionRow;
  const prog = PROGRAMMES[s.programme];
  const join = await joinInfo(s.code);
  return (
    <div style={{ ["--accent" as string]: prog.accent }}>
      <SessionLive session={s} prog={prog} facit={FACIT[s.programme]} host={join.host} qrSvg={join.qrSvg} />
    </div>
  );
}
