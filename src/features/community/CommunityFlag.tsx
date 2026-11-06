import { es } from "@/i18n/es";
import { formatMessage } from "@/i18n/format";

import { flagUrl } from "./community-flag";

import styles from "./CommunityLayout.module.css";

/** The flag of the community, beside its name. Nothing at all when there is none. */
export function CommunityFlag(props: {
  territoryId: string;
  name: string;
}): React.JSX.Element | null {
  const src = flagUrl(props.territoryId);
  if (src === null) return null;
  return (
    <img
      className={styles.flag}
      src={src}
      alt={formatMessage(es.community.page.flag, { name: props.name })}
    />
  );
}
