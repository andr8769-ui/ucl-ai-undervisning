import "server-only";
import { readPrivate } from "./private-files";
import type { ProgKey } from "./programmes";

export async function slideCount(prog: ProgKey) {
  const raw = await readPrivate(prog, "notes.json");
  return (JSON.parse(raw.toString("utf-8")) as { count: number }).count;
}
