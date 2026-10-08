import "server-only";
import { NextResponse } from "next/server";

export const ok = (data: unknown = { ok: true }, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function body<T>(req: Request): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    return {};
  }
}

export const cleanUsername = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
export const validUsername = (v: string) => /^[\p{L}\p{N} ._-]{2,24}$/u.test(v);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeCode(len = 5) {
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s;
}
