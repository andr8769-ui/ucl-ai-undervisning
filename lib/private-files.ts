import "server-only";
import { readFile } from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "private");

export async function readPrivate(...parts: string[]) {
  const p = path.join(ROOT, ...parts);
  if (!p.startsWith(ROOT + path.sep)) throw new Error("Ugyldig sti");
  return readFile(p);
}
