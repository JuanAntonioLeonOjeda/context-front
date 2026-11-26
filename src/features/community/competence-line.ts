/**
 * The line under a news item that names the bodies with competence in its topic (ADR-0027): a fact
 * of each body, with a link to its organisation chart; never a person, a party or "responsable".
 * Pure: the API's bodies and the sector the page shows in, the line out.
 */
import { es } from "@/i18n/es";

import type { CompetentBody } from "./news-api";

export interface CompetenceLink {
  key: string;
  name: string;
  href: string; // the chart the body is in
}

export interface CompetenceLine {
  label: string; // "Competencia" or "Competencia compartida"
  bodies: CompetenceLink[];
}

/** The chart of a body: its community's, or the general one (the State and the local bodies). */
function chartOf(body: CompetentBody): string {
  return body.level === "ccaa" && body.territoryId !== null
    ? `/comunidades/${body.territoryId}/organigrama`
    : "/organigrama";
}

/**
 * The bodies reached by the sector the page shows, in the API's order (State, community, local);
 * null when there is none (no chart for the community yet, or no body for that sector). The
 * competence is said shared when the item had no level and the competence table's were used.
 */
export function competenceLine(
  bodies: readonly CompetentBody[],
  sector: string,
): CompetenceLine | null {
  const shown = bodies.filter((body) => body.sectorId === sector);
  if (shown.length === 0) return null;
  const { competence } = es.community.news;
  return {
    label: shown.some((body) => body.shared) ? competence.shared : competence.label,
    bodies: shown.map((body) => ({ key: body.bodyId, name: body.name, href: chartOf(body) })),
  };
}
