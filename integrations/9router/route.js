import { getCombos } from "@/lib/localDb";
import { readInternalCombos } from "@/lib/ltnInternalCombos.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request) {
  return readInternalCombos(request, process.env, getCombos);
}
