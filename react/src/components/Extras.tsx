import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx";

type Span = HTMLAttributes<HTMLSpanElement>;
type Div = HTMLAttributes<HTMLDivElement>;

export type StarburstProps = Div & {
  color?: "yellow" | "red" | "lime";
  large?: boolean;
  /** Pin to the top-right corner of the nearest positioned ancestor. */
  corner?: boolean;
};

export function Starburst({ color = "yellow", large, corner, className, ...rest }: StarburstProps) {
  return <div className={cx("g95-starburst", color !== "yellow" && `g95-starburst--${color}`, large && "g95-starburst--lg", corner && "g95-corner", className)} {...rest} />;
}

/** Blinking red "NEW!" style badge. */
export function Badge({ className, ...rest }: Span) {
  return <span className={cx("g95-badge", className)} {...rest} />;
}

export function Blink({ className, ...rest }: Span) {
  return <span className={cx("g95-blink", className)} {...rest} />;
}

export function Stamp({ ok, className, ...rest }: Span & { ok?: boolean }) {
  return <span className={cx("g95-stamp", ok && "g95-stamp--ok", className)} {...rest} />;
}

export function Note({ color = "yellow", className, ...rest }: Div & { color?: "yellow" | "green" | "pink" }) {
  return <div className={cx("g95-note", color !== "yellow" && `g95-note--${color}`, className)} {...rest} />;
}

export type AlertProps = Div & { tone?: "danger" | "ok" | "warn"; glyph?: ReactNode };

export function Alert({ tone = "danger", glyph, className, children, ...rest }: AlertProps) {
  return (
    <div role={tone === "ok" ? "status" : "alert"} className={cx("g95-alert", tone !== "danger" && `g95-alert--${tone}`, className)} {...rest}>
      {glyph !== undefined && <span className="g95-dialog__glyph" aria-hidden="true">{glyph}</span>}
      <div>{children}</div>
    </div>
  );
}

/** Yellow and black hazard stripe. */
export function Tape({ className, ...rest }: Div) {
  return <div className={cx("g95-tape", className)} role="presentation" {...rest} />;
}

export function Construction({ className, children = "Under construction", ...rest }: Span) {
  return <span className={cx("g95-construction", className)} {...rest}>{children}</span>;
}

/** Scrolling ticker. Pauses on hover; stops under `prefers-reduced-motion`. */
export function Marquee({ className, children, ...rest }: Div) {
  return (
    <div className={cx("g95-marquee", className)} {...rest}>
      <span>{children}</span>
    </div>
  );
}

export type CounterProps = Omit<Span, "children"> & { value: number | string; /** Zero-pad to this many digits. */ digits?: number };

/** Odometer-style hit counter. */
export function Counter({ value, digits = 6, className, ...rest }: CounterProps) {
  const text = String(value).padStart(digits, "0");
  return (
    <span className={cx("g95-counter", className)} role="img" aria-label={String(value)} {...rest}>
      {[...text].map((d, i) => <b key={i} aria-hidden="true">{d}</b>)}
    </span>
  );
}

export function Led({ color = "green", className, ...rest }: Span & { color?: "green" | "red" | "off" }) {
  return <span className={cx("g95-led", color !== "green" && `g95-led--${color}`, className)} {...rest} />;
}

export function Banner({ className, ...rest }: Div) {
  return <div className={cx("g95-banner", className)} {...rest} />;
}

export function RainbowBar({ thick, className, ...rest }: Div & { thick?: boolean }) {
  return <div className={cx("g95-rainbow-bar", thick && "g95-rainbow-bar--thick", className)} role="presentation" {...rest} />;
}

export function RainbowText({ className, ...rest }: Span) {
  return <span className={cx("g95-rainbow-text", className)} {...rest} />;
}
