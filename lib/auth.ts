import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const TEACHER_COOKIE = "laerer";
const STUDENT_COOKIE = "deltager";

function secret() {
  const s = process.env.COOKIE_SECRET;
  if (!s) throw new Error("Mangler COOKIE_SECRET");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkTeacherCode(code: string) {
  const expected = process.env.TEACHER_CODE || "";
  if (!expected) return false;
  return safeEqual(code.trim(), expected);
}

const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function setTeacher() {
  (await cookies()).set(TEACHER_COOKIE, `ok.${sign("teacher")}`, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
}
export async function clearTeacher() {
  (await cookies()).delete(TEACHER_COOKIE);
}
export async function isTeacher() {
  const v = (await cookies()).get(TEACHER_COOKIE)?.value;
  if (!v) return false;
  return safeEqual(v, `ok.${sign("teacher")}`);
}

export async function setStudent(participantId: string, sessionId: string) {
  const payload = `${participantId}.${sessionId}`;
  (await cookies()).set(STUDENT_COOKIE, `${payload}.${sign(payload)}`, { ...cookieOpts, maxAge: 60 * 60 * 12 });
}
export async function getStudent(): Promise<{ participantId: string; sessionId: string } | null> {
  const v = (await cookies()).get(STUDENT_COOKIE)?.value;
  if (!v) return null;
  const parts = v.split(".");
  if (parts.length !== 3) return null;
  const [pid, sid, sig] = parts;
  if (!safeEqual(sig, sign(`${pid}.${sid}`))) return null;
  return { participantId: pid, sessionId: sid };
}
export async function clearStudent() {
  (await cookies()).delete(STUDENT_COOKIE);
}
