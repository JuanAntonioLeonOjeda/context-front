// Regenerates the typed API client from the backend's OpenAPI contract.
//
//   pnpm api:generate                      # backend running on http://localhost:8000
//   API_OPENAPI_URL=https://… pnpm api:generate
//
// The contract is downloaded to src/api/openapi.json and committed, and the types
// (src/api/schema.d.ts) are generated from that file. CI therefore needs no backend, and a
// contract change shows up as a diff in the pull request.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const url = process.env.API_OPENAPI_URL ?? "http://localhost:8000/openapi.json";

const response = await fetch(url).catch((error) => {
  throw new Error(
    `Could not reach ${url}. Is the backend running? (${error.cause?.code ?? error.message})`,
  );
});
if (!response.ok) {
  throw new Error(`${url} answered ${response.status}`);
}
const contract = await response.json();
if (typeof contract.openapi !== "string" || typeof contract.paths !== "object") {
  throw new Error(`${url} did not return an OpenAPI document`);
}

writeFileSync("src/api/openapi.json", `${JSON.stringify(contract, null, 2)}\n`);
// One definition of how types are generated: the `api:types` script (also run by CI).
execFileSync("pnpm", ["run", "api:types"], { stdio: "inherit" });
console.log(`Contract from ${url}: ${Object.keys(contract.paths).length} paths`);
