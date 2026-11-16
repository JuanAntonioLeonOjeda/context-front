/**
 * The organisation charts (`GET /organization`, `GET /communities/{id}/organization`): bodies, the
 * holder of the head post of each executive and department, and the competences the law gives each
 * body, every one with its source. Validated at the edge with zod and mapped to the feature's own
 * types here (snake_case stays in the API layer). Nothing is decided in the browser: whether an
 * executive can be drawn, its order and every date come from the backend.
 */
import { z } from "zod";

import { api } from "@/api/client";

const sectorSchema = z.object({ id: z.string(), name: z.string() });

const competenceSchema = z.object({
  summary: z.string(),
  legal_basis: z.string(),
  sectors: z.array(sectorSchema),
  source_url: z.url(),
});

const holderSchema = z.object({
  name: z.string(),
  post_title: z.string(),
  since: z.iso.date(),
  source_url: z.url(),
});

const bodySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["executive_head", "department", "parliament", "judiciary", "local"]),
  level: z.enum(["state", "ccaa", "local"]),
  dir3_id: z.string().nullable(),
  source_url: z.url(),
  holder: holderSchema.nullable(),
  competences: z.array(competenceSchema),
});

const statusSchema = z.enum(["complete", "no_data"]);

const executiveSchema = z
  .object({
    status: statusSchema,
    head: bodySchema.nullable(),
    departments: z.array(bodySchema),
  })
  // Complete or nothing: a complete executive has a holder in every body, and one that cannot be
  // drawn carries nothing. An answer that breaks it is refused, never drawn half.
  .refine(
    (executive) =>
      executive.status === "complete"
        ? executive.head?.holder != null && executive.departments.every((d) => d.holder != null)
        : executive.head === null && executive.departments.length === 0,
    { message: "an executive that is not complete or nothing" },
  );

const organizationShape = {
  territory_id: z.string(),
  as_of: z.iso.date(),
  executive: executiveSchema,
  parliaments: z.array(bodySchema),
  judiciary: z.array(bodySchema),
  local: z.array(bodySchema),
};
const organizationSchema = z.object(organizationShape);
const generalSchema = z.object({
  ...organizationShape,
  communities: z.array(
    z.object({ territory_id: z.string(), name: z.string(), executive_status: statusSchema }),
  ),
});

export interface Sector {
  id: string;
  name: string;
}

export interface Competence {
  summary: string; // in the project's own words
  legalBasis: string; // the article
  sectors: Sector[];
  sourceUrl: string;
}

export interface Holder {
  name: string;
  postTitle: string; // as the appointment writes it
  since: string; // ISO date of the decree that gave the post under that title
  sourceUrl: string;
}

export interface Body {
  id: string;
  name: string; // the official name
  kind: "executive_head" | "department" | "parliament" | "judiciary" | "local";
  level: "state" | "ccaa" | "local";
  holder: Holder | null; // only the head of an executive and a department have one
  competences: Competence[];
  sourceUrl: string;
}

export type ExecutiveStatus = "complete" | "no_data";

export interface Executive {
  status: ExecutiveStatus;
  head: Body | null;
  departments: Body[]; // by name, as the backend orders them
}

export interface Organization {
  territoryId: string; // "es" for the general chart
  asOf: string; // ISO date the answer is valid for
  executive: Executive;
  parliaments: Body[];
  judiciary: Body[];
  local: Body[];
}

export interface CommunityRef {
  territoryId: string;
  name: string;
  executiveStatus: ExecutiveStatus;
}

export interface GeneralOrganization extends Organization {
  communities: CommunityRef[]; // by name
}

type ParsedBody = z.infer<typeof bodySchema>;

function mapBody(body: ParsedBody): Body {
  return {
    id: body.id,
    name: body.name,
    kind: body.kind,
    level: body.level,
    sourceUrl: body.source_url,
    holder:
      body.holder === null
        ? null
        : {
            name: body.holder.name,
            postTitle: body.holder.post_title,
            since: body.holder.since,
            sourceUrl: body.holder.source_url,
          },
    competences: body.competences.map((c) => ({
      summary: c.summary,
      legalBasis: c.legal_basis,
      sectors: c.sectors,
      sourceUrl: c.source_url,
    })),
  };
}

function mapOrganization(parsed: z.infer<typeof organizationSchema>): Organization {
  return {
    territoryId: parsed.territory_id,
    asOf: parsed.as_of,
    executive: {
      status: parsed.executive.status,
      head: parsed.executive.head === null ? null : mapBody(parsed.executive.head),
      departments: parsed.executive.departments.map(mapBody),
    },
    parliaments: parsed.parliaments.map(mapBody),
    judiciary: parsed.judiciary.map(mapBody),
    local: parsed.local.map(mapBody),
  };
}

/** The general chart: the State, and the list of the communities. */
export async function fetchOrganization(): Promise<GeneralOrganization> {
  const { data, response } = await api.GET("/organization");
  if (!response.ok) {
    throw new Error(`GET /organization answered ${String(response.status)}`);
  }
  const parsed = generalSchema.parse(data);
  return {
    ...mapOrganization(parsed),
    communities: parsed.communities.map((c) => ({
      territoryId: c.territory_id,
      name: c.name,
      executiveStatus: c.executive_status,
    })),
  };
}

/** `null` when the API knows no such community (its 404). */
export async function fetchCommunityOrganization(
  territoryId: string,
): Promise<Organization | null> {
  const { data, response } = await api.GET("/communities/{territory_id}/organization", {
    params: { path: { territory_id: territoryId } },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `GET /communities/${territoryId}/organization answered ${String(response.status)}`,
    );
  }
  return mapOrganization(organizationSchema.parse(data));
}
