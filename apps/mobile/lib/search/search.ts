import type { SearchHit } from "@nurlai/contracts";
import { rpc } from "../api/api";

export async function querySpaceSearch(q: string, signal?: AbortSignal): Promise<SearchHit[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const result = await rpc("search/query", { q: trimmed }, { signal });
  return result.hits;
}
