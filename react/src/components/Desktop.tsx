import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../cx";
import { Button } from "./Button";

export function Desktop({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("g95-desktop", className)} {...rest} />;
}

export function DesktopIcons({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("g95-icons", className)} {...rest} />;
}

export type DesktopIconProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: ReactNode;
  label: ReactNode;
  selected?: boolean;
  /** Double-click or Enter. Single click still fires `onClick`. */
  onOpen?: () => void;
};

export function DesktopIcon({ icon, label, selected, onOpen, className, onKeyDown, onDoubleClick, ...rest }: DesktopIconProps) {
  return (
    <button
      type="button"
      className={cx("g95-icon", selected && "is-selected", className)}
      onDoubleClick={(e) => {
        onDoubleClick?.(e);
        onOpen?.();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" && onOpen) {
          e.preventDefault();
          onOpen();
        }
      }}
      {...rest}
    >
      <span className="g95-icon__img" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/** The four-colour flag. */
export function Logo({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("g95-logo", className)} aria-hidden="true" {...rest} />;
}

export function useClock(intervalMs = 15000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export type ClockProps = HTMLAttributes<HTMLTimeElement> & { format?: (d: Date) => string };

const defaultFormat = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function Clock({ format = defaultFormat, ...rest }: ClockProps) {
  const now = useClock();
  return <time dateTime={now.toISOString()} {...rest}>{format(now)}</time>;
}

export type StartMenuItem =
  | { label: ReactNode; icon?: ReactNode; href?: string; onSelect?: () => void; key?: string }
  | "separator";

export type TaskbarTask = { id: string; label: ReactNode; active?: boolean; onClick?: () => void };

export type TaskbarProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  startItems?: StartMenuItem[];
  startLabel?: ReactNode;
  /** Text on the vertical stripe of the Start menu. */
  brand?: string;
  tasks?: TaskbarTask[];
  /** Tray content shown before the clock. */
  tray?: ReactNode;
  clock?: boolean;
};

/** Fixed bottom taskbar with a working Start menu (closes on outside click, Escape, or picking an item). */
export function Taskbar({ startItems = [], startLabel = "Start", brand, tasks = [], tray, clock = true, className, ...rest }: TaskbarProps) {
  const [open, setOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!startRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const brandStyle = brand === undefined ? undefined : { ["--g95-menu-brand" as string]: JSON.stringify(brand) };

  return (
    <nav className={cx("g95-taskbar", className)} aria-label="Taskbar" {...rest}>
      {startItems.length > 0 && (
        <div className="g95-start" ref={startRef}>
          {open && (
            <div className="g95-menu" id={menuId} style={brandStyle}>
              {startItems.map((item, i) => {
                if (item === "separator") return <hr key={`sep-${i}`} />;
                const content = (
                  <>
                    {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </>
                );
                const pick = () => {
                  setOpen(false);
                  item.onSelect?.();
                };
                return item.href !== undefined ? (
                  <a key={item.key ?? i} href={item.href} onClick={pick}>{content}</a>
                ) : (
                  <button key={item.key ?? i} type="button" onClick={pick}>{content}</button>
                );
              })}
            </div>
          )}
          <button ref={buttonRef} type="button" className="g95-btn" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((o) => !o)}>
            <Logo /> {startLabel}
          </button>
        </div>
      )}
      <div className="g95-tasks">
        {tasks.map((t) => (
          <Button key={t.id} pressed={t.active} onClick={t.onClick}>{t.label}</Button>
        ))}
      </div>
      {(tray !== undefined || clock) && (
        <div className="g95-tray">
          {tray}
          {clock && <Clock />}
        </div>
      )}
    </nav>
  );
}
