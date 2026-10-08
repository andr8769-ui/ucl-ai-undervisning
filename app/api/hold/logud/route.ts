import { clearStudent } from "@/lib/auth";
import { ok } from "@/lib/http";

export async function POST() {
  await clearStudent();
  return ok();
}
