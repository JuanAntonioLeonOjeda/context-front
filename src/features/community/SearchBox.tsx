import styles from "./CommunityCard.module.css";

/** The box where a reader types what to look for in a list; it filters as they type. */
export function SearchBox(props: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <label className={styles.search}>
      {props.label}
      <input
        type="search"
        value={props.value}
        placeholder={props.placeholder}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    </label>
  );
}
