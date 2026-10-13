import "@/design/tokens.css";
import "@/design/base.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { es } from "@/i18n/es";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("index.html has no #root element");
}

// Placeholder until the root layout and routes exist (task 5).
createRoot(root).render(
  <StrictMode>
    <h1>{es.app.shell.name}</h1>
  </StrictMode>,
);
