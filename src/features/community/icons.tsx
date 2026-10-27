/** Small line icons for the news actions: drawn here, `currentColor`, hidden from assistive tech
 *  (the text next to them says what the action is). */
function Icon({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** An arrow leaving a box: the page of the outlet, in another tab. */
export function SourceIcon(): React.JSX.Element {
  return (
    <Icon>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

/** A root that branches to the right: the tree of related news. */
export function TreeIcon(): React.JSX.Element {
  return (
    <Icon>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.5 12h2.5a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h2.5" />
      <path d="M12 12v4a2 2 0 0 0 2 2h2.5" />
    </Icon>
  );
}

/** A chevron that points down when a section is open and right when it is closed. */
export function ChevronIcon(): React.JSX.Element {
  return (
    <Icon>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

/** An open tray: nothing in it. */
export function EmptyIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
