/**
 * The organisation charts as the pages draw them. Pure: the backend's facts are only written in
 * Spanish. Nothing is ordered, filtered or completed here: the executive comes complete or not at
 * all, and every list comes in the backend's order.
 */
import { es } from "@/i18n/es";
import { formatLongDate, formatMessage, listInSpanish } from "@/i18n/format";

import type {
  Body,
  CommunityRef,
  Competence,
  Executive,
  ExecutiveStatus,
  Holder,
} from "./organization-api";

export interface CompetenceView {
  summary: string;
  legalBasis: string;
  sectors: string; // "Economía y Impuestos"
  sourceUrl: string;
}

export interface HolderView {
  name: string;
  title: string; // as the appointment writes it
  since: string; // "Desde el 26 de marzo de 2026"
  sourceUrl: string;
}

export interface BoxView {
  id: string;
  name: string;
  holder: HolderView | null;
  competences: CompetenceView[];
  competencesLabel: string; // "Competencias (2)", or the sentence that there are none
  sourceUrl: string;
}

export interface ExecutiveView {
  status: ExecutiveStatus;
  head: BoxView | null;
  departments: BoxView[];
}

export interface CommunityLink {
  territoryId: string;
  name: string;
  href: string; // the community's own chart
  status: string; // "Gobierno completo" or "Sin datos todavía"
}

function competenceView(competence: Competence): CompetenceView {
  return {
    summary: competence.summary,
    legalBasis: competence.legalBasis,
    sectors: listInSpanish(competence.sectors.map((sector) => sector.name)),
    sourceUrl: competence.sourceUrl,
  };
}

function holderView(holder: Holder): HolderView {
  return {
    name: holder.name,
    title: holder.postTitle,
    since: formatMessage(es.organization.box.since, { date: formatLongDate(holder.since) }),
    sourceUrl: holder.sourceUrl,
  };
}

export function boxView(body: Body): BoxView {
  const count = body.competences.length;
  return {
    id: body.id,
    name: body.name,
    holder: body.holder === null ? null : holderView(body.holder),
    competences: body.competences.map(competenceView),
    competencesLabel:
      count === 0
        ? es.organization.box.noCompetences
        : formatMessage(es.organization.box.competencesCount, { count: String(count) }),
    sourceUrl: body.sourceUrl,
  };
}

export function executiveView(executive: Executive): ExecutiveView {
  return {
    status: executive.status,
    head: executive.head === null ? null : boxView(executive.head),
    departments: executive.departments.map(boxView),
  };
}

export function communityLinks(communities: readonly CommunityRef[]): CommunityLink[] {
  return communities.map((community) => ({
    territoryId: community.territoryId,
    name: community.name,
    href: `/comunidades/${community.territoryId}/organigrama`,
    status:
      community.executiveStatus === "complete"
        ? es.organization.communities.complete
        : es.organization.communities.noData,
  }));
}
