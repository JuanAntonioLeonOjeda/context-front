import { es } from "@/i18n/es";

/**
 * What an unexpected error looks like to the reader: a message and a retry, never the
 * error itself (it may carry internals). Reloading is the retry: route data is not cached
 * across a crash.
 */
export function ErrorMessage(): React.JSX.Element {
  return (
    <div role="alert">
      <title>{`${es.errors.boundary.title} · ${es.app.shell.name}`}</title>
      <h1>{es.errors.boundary.title}</h1>
      <p>{es.errors.boundary.message}</p>
      <button
        type="button"
        onClick={() => {
          window.location.reload();
        }}
      >
        {es.errors.boundary.retry}
      </button>
    </div>
  );
}
