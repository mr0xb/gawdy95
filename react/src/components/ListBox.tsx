import { useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../cx";

export type ListBoxItem = string | { value: string; label: ReactNode };

export type ListBoxProps = Omit<HTMLAttributes<HTMLUListElement>, "onChange" | "defaultValue"> & {
  items: ListBoxItem[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Fires on double-click or Enter, like opening a file. */
  onActivate?: (value: string) => void;
  label?: string;
};

const norm = (i: ListBoxItem) => (typeof i === "string" ? { value: i, label: i } : i);

/** A white, sunken single-select list box. Arrow keys move the selection. */
export function ListBox({ items, value, defaultValue = null, onChange, onActivate, label, className, ...rest }: ListBoxProps) {
  const base = useId();
  const [inner, setInner] = useState<string | null>(defaultValue);
  const selected = value === undefined ? inner : value;
  const list = items.map(norm);
  const index = list.findIndex((i) => i.value === selected);

  const select = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (list.length === 0) return;
    let next: number | undefined;
    if (e.key === "ArrowDown") next = Math.min(list.length - 1, index + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, index < 0 ? 0 : index - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = list.length - 1;
    else if (e.key === "Enter" && selected != null) {
      e.preventDefault();
      onActivate?.(selected);
      return;
    }
    if (next === undefined) return;
    e.preventDefault();
    select(list[next].value);
    document.getElementById(`${base}-${next}`)?.scrollIntoView?.({ block: "nearest" });
  };

  return (
    <ul
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={index >= 0 ? `${base}-${index}` : undefined}
      className={cx("g95-list", className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {list.map((item, i) => (
        <li
          key={item.value}
          id={`${base}-${i}`}
          role="option"
          aria-selected={item.value === selected}
          onClick={() => select(item.value)}
          onDoubleClick={() => onActivate?.(item.value)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
