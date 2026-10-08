import { notFound, redirect } from "next/navigation";
import { isTeacher } from "@/lib/auth";
import { db, SessionRow } from "@/lib/db";
import { PROGRAMMES } from "@/lib/programmes";
import { slideCount } from "@/lib/deck";
import SpeakerView from "@/components/SpeakerView";

export const dynamic = "force-dynamic";

export default async function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isTeacher())) redirect("/laerer");
  const { id } = await params;
  const { data } = await db().from("sessions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const s = data as SessionRow;
  const prog = PROGRAMMES[s.programme];
  const count = await slideCount(s.programme);
  return (
    <div style={{ ["--accent" as string]: prog.accent }}>
      <SpeakerView sessionId={s.id} progKey={prog.key} progName={prog.name} className={s.class_name} count={count} />
    </div>
  );
}
