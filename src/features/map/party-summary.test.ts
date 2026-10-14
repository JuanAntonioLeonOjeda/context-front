import { describe, expect, it } from "vitest";

import type { Party } from "@/design/parties";

import type { CommunityLook } from "./community-look";
import { summarise } from "./party-summary";

const party = (id: string): Party => ({
  id,
  name: id,
  shortName: id.toUpperCase(),
  colour: "#123456",
});
const [cc, pp, psoe, vox] = [party("cc"), party("pp"), party("psoe"), party("vox")] as const;

function look(territoryId: string, parties: Party[], isCaretaker = false): CommunityLook {
  return {
    territoryId,
    name: territoryId,
    fill: { kind: "no-data" },
    label: territoryId,
    parties,
    isCaretaker,
  };
}

describe("summarise", () => {
  const looks = [
    look("ccaa-01", [pp]),
    look("ccaa-02", [pp, vox]),
    look("ccaa-03", [psoe]),
    look("ccaa-05", [cc, pp], true),
  ];

  it("lists each party once with the communities where it governs", () => {
    const { rows } = summarise(looks);

    expect(rows.map((r) => [r.party.id, r.communityIds])).toEqual([
      ["cc", ["ccaa-05"]],
      ["pp", ["ccaa-01", "ccaa-02", "ccaa-05"]],
      ["psoe", ["ccaa-03"]],
      ["vox", ["ccaa-02"]],
    ]);
  });

  it("orders the rows by id, not by how many communities a party governs", () => {
    const { rows } = summarise(looks);

    const ids = rows.map((r) => r.party.id);
    expect(ids).toEqual([...ids].sort());
    expect(rows.find((r) => r.party.id === "pp")?.communityIds).toHaveLength(3);
    expect(rows[0]?.communityIds).toHaveLength(1);
  });

  it("counts coalition and caretaker governments over the communities with data", () => {
    expect(summarise(looks)).toMatchObject({ total: 4, coalitions: 2, caretakers: 1 });
  });

  it("leaves out communities without data and says so", () => {
    const summary = summarise([...looks, look("ccaa-09", [])]);

    expect(summary).toMatchObject({ total: 4, hasNoData: true });
    expect(summarise(looks).hasNoData).toBe(false);
  });
});
