import { expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { es } from "@/i18n/es";

/** The news section is drawn and has stopped loading: what tests wait for before asserting. */
export async function newsLoaded(): Promise<void> {
  await screen.findByRole("region", { name: es.community.news.title });
  await waitFor(() => {
    expect(screen.queryByText(es.community.news.loading)).toBeNull();
  });
}
