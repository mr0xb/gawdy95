import { useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../cx";

export type TabItem = { id: string; label: ReactNode; content: ReactNode; disabled?: boolean };

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  tabs: TabItem[];
  /** Controlled selected tab id. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  panelClassName?: string;
};

/** Property-sheet tabs with arrow-key, Home and End navigation. */
export function Tabs({ tabs, value, defaultValue, onChange, label, panelClassName, className, ...rest }: TabsProps) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs.find((t) => !t.disabled)?.id);
  const selected = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    if (value === undefined) setInner(id);
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    const current = enabled.indexOf(tabs.findIndex((t) => t.id === selected));
    let next: number | undefined;
    if (e.key === "ArrowRight") next = enabled[(current + 1) % enabled.length];
    else if (e.key === "ArrowLeft") next = enabled[(current - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className={className} {...rest}>
      <div className="g95-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            className="g95-tab"
            id={`${base}-tab-${t.id}`}
            aria-controls={`${base}-panel-${t.id}`}
            aria-selected={t.id === selected}
            tabIndex={t.id === selected ? 0 : -1}
            disabled={t.disabled}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          className={cx("g95-tabpanel", panelClassName)}
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== selected}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
