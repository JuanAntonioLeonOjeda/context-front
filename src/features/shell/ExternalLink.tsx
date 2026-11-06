/** A link to another site: it opens in a new tab and does not hand that site this window. */
export function ExternalLink(props: React.ComponentPropsWithoutRef<"a">): React.JSX.Element {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- the content arrives in props
    <a {...props} target="_blank" rel="noopener noreferrer" />
  );
}
