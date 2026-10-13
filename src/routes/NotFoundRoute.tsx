import { Link } from "react-router";

import { es } from "@/i18n/es";

export function NotFoundRoute(): React.JSX.Element {
  return (
    <>
      <title>{`${es.errors.notFound.title} · ${es.app.shell.name}`}</title>
      <h1>{es.errors.notFound.title}</h1>
      <p>{es.errors.notFound.message}</p>
      <p>
        <Link to="/">{es.errors.notFound.home}</Link>
      </p>
    </>
  );
}
