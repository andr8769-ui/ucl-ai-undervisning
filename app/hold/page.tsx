import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStudent } from "@/lib/auth";
import { PROGRAMMES } from "@/lib/programmes";
import StudentApp from "@/components/StudentApp";

export const dynamic = "force-dynamic";

export default async function HoldPage() {
  const me = await getStudent();
  if (!me) redirect("/");
  const [s, p] = await Promise.all([
    db().from("sessions").select("code,programme,class_name,session_date,status").eq("id", me.sessionId).maybeSingle(),
    db().from("participants").select("username").eq("id", me.participantId).maybeSingle(),
  ]);
  if (!s.data || !p.data) redirect("/");
  const prog = PROGRAMMES[s.data.programme as keyof typeof PROGRAMMES];
  return (
    <div style={{ ["--accent" as string]: prog.accent }}>
      <StudentApp
        prog={prog}
        username={p.data.username}
        className={s.data.class_name}
        date={s.data.session_date}
        open={s.data.status === "open"}
      />
    </div>
  );
}
