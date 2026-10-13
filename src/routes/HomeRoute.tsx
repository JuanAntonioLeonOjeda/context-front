import { es } from "@/i18n/es";

/** Placeholder home until the map arrives (`map-governments`). */
export function HomeRoute(): React.JSX.Element {
  return (
    <>
      <title>{es.app.shell.name}</title>
      <h1>{es.app.shell.name}</h1>
      <p>{es.app.shell.description}</p>
    </>
  );
}
