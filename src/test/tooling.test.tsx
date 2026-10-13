import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axeViolations } from "@/test/axe";

describe("test tooling", () => {
  it("renders with Testing Library and resolves the @/ alias", () => {
    render(<button type="button">Aceptar</button>);

    expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument();
  });

  it("reports an accessibility violation and none for accessible markup", async () => {
    // eslint-disable-next-line jsx-a11y/alt-text -- the missing alt is what this test checks
    const { container: bad } = render(<img src="x.png" />);
    const { container: good } = render(<img src="x.png" alt="Mapa de España" />);

    expect((await axeViolations(bad)).map((v) => v.id)).toContain("image-alt");
    expect(await axeViolations(good)).toEqual([]);
  });
});
