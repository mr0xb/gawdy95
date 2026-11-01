import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../cx";
import { useGawdyThemeContext, type GawdyTheme } from "./Theme";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "children"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Visible label. Also the switch's accessible name; pass `aria-label` when there is no visible label. */
  label?: ReactNode;
  labelPosition?: "start" | "end";
  size?: "sm" | "md";
  /** Shown on the thumb. */
  thumb?: ReactNode | ((checked: boolean) => ReactNode);
  /** Shown in the track on the side the thumb is not covering. Defaults to ON / OFF. */
  onText?: ReactNode;
  offText?: ReactNode;
};

/** A Win95-style on/off switch: a sunken track and a bevelled thumb that slides across in chunky steps. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onChange, label, labelPosition = "end", size = "md", thumb, onText = "ON", offText = "OFF", className, onClick, ...rest },
  ref,
) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const labelEl = label !== undefined && <span className="g95-switch__label">{label}</span>;
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      className={cx("g95-switch", size === "sm" && "g95-switch--sm", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (checked === undefined) setInner(!on);
        onChange?.(!on);
      }}
      {...rest}
    >
      {labelPosition === "start" && labelEl}
      <span className="g95-switch__track" aria-hidden="true">
        <span className="g95-switch__text">{on ? onText : offText}</span>
        <span className="g95-switch__thumb">{typeof thumb === "function" ? thumb(on) : thumb}</span>
      </span>
      {labelPosition === "end" && labelEl}
    </button>
  );
});

export type ThemeSwitchProps = Omit<SwitchProps, "checked" | "defaultChecked" | "onChange" | "thumb" | "onText" | "offText" | "label"> & {
  /** Controlled theme. Without it the switch drives the nearest `<GawdyRoot>`, or keeps its own state outside one. */
  theme?: GawdyTheme;
  onChange?: (theme: GawdyTheme) => void;
  /** Visible label. Default "Dark mode"; pass `null` to hide it (the accessible name stays "Dark mode"). */
  label?: ReactNode | null;
  sunIcon?: ReactNode;
  moonIcon?: ReactNode;
};

/** A light/dark toggle: blue sky and sun by day, starfield and moon by night. Checked means dark. */
export const ThemeSwitch = forwardRef<HTMLButtonElement, ThemeSwitchProps>(function ThemeSwitch(
  { theme, onChange, label = "Dark mode", sunIcon = "☀️", moonIcon = "🌙", className, ...rest },
  ref,
) {
  const ctx = useGawdyThemeContext();
  const [inner, setInner] = useState<GawdyTheme>("light");
  const current = theme ?? ctx?.theme ?? inner;

  const change = (dark: boolean) => {
    const next: GawdyTheme = dark ? "dark" : "light";
    if (theme === undefined) (ctx ? ctx.setTheme : setInner)(next);
    onChange?.(next);
  };

  return (
    <Switch
      ref={ref}
      className={cx("g95-switch--theme", className)}
      checked={current === "dark"}
      onChange={change}
      thumb={(dark) => (dark ? moonIcon : sunIcon)}
      onText={sunIcon}
      offText={moonIcon}
      label={label ?? undefined}
      aria-label={label === null ? "Dark mode" : undefined}
      {...rest}
    />
  );
});
