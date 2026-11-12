/**
 * Which indicator each sector is measured by, as the API says it (`GET /sectors`): the pairing
 * is data of the backend, never decided here. Validated at the edge with zod.
 */
import { z } from "zod";

import { api } from "@/api/client";

const sectorsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    indicator_id: z.string().nullable(),
  }),
);

/** Sector id → indicator id; a sector with no indicator is left out. */
export async function fetchSectorIndicators(): Promise<Map<string, string>> {
  const { data, response } = await api.GET("/sectors");
  if (!response.ok) {
    throw new Error(`GET /sectors answered ${String(response.status)}`);
  }
  const pairs = new Map<string, string>();
  for (const sector of sectorsSchema.parse(data)) {
    if (sector.indicator_id !== null) pairs.set(sector.id, sector.indicator_id);
  }
  return pairs;
}
