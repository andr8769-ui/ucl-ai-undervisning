"use client";

export type PresMsg =
  | { type: "goto"; n: number }
  | { type: "state"; n: number; overlay: Overlay; anon: boolean }
  | { type: "hello" }
  | { type: "overlay"; overlay: Overlay }
  | { type: "anon"; anon: boolean };

export type Overlay = "none" | "code" | "questions";

export type Question = { id: string; username: string; body: string; status: "new" | "shown" | "done"; created_at: string };

export const slideUrl = (prog: string, n: number) => `/api/laerer/slide/${prog}/${n}`;
export const storeKey = (sessionId: string) => `slide-${sessionId}`;

export function readSlide(sessionId: string, count: number) {
  try {
    const v = Number(localStorage.getItem(storeKey(sessionId)));
    if (Number.isInteger(v) && v >= 1 && v <= count) return v;
  } catch {}
  return 1;
}
export function writeSlide(sessionId: string, n: number) {
  try { localStorage.setItem(storeKey(sessionId), String(n)); } catch {}
}

export function channel(sessionId: string): BroadcastChannel | null {
  try { return new BroadcastChannel(`pres-${sessionId}`); } catch { return null; }
}

export async function fetchQuestions(sessionId: string): Promise<Question[] | null> {
  try {
    const r = await fetch(`/api/laerer/sessions/${sessionId}/spoergsmaal`, { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

export function setQuestionStatus(id: string, status: Question["status"]) {
  return fetch(`/api/laerer/spoergsmaal/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}
