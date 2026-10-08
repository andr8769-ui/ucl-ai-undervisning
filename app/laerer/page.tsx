import { isTeacher } from "@/lib/auth";
import { db, SessionRow } from "@/lib/db";
import TeacherLogin from "@/components/TeacherLogin";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function LaererPage() {
  if (!(await isTeacher())) return <TeacherLogin />;
  const { data } = await db().from("sessions").select("*").order("session_date", { ascending: false }).order("created_at", { ascending: false });
  return <Dashboard sessions={(data ?? []) as SessionRow[]} />;
}
