import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("index.html has no #root element");
}

// Placeholder until the root layout and routes exist (tasks 4 and 5).
createRoot(root).render(
  <StrictMode>
    <h1>Contexto autonómico</h1>
  </StrictMode>,
);
