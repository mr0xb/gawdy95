import { createContext, forwardRef, useContext, useId, useMemo, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../cx";
import { useGawdyBody, useIsoLayoutEffect } from "./Root";
import { Switch, type SwitchProps } from "./Switch";
import { DEFAULT_THEME_STORAGE_KEY, GawdyThemeContext, useGawdyTheme, usePreference, type GawdyTheme } from "./Theme";

/** `custom` is your own UI (the light side of the switch); `gawdy` is Gawdy95 (the dark side). */
export type GawdyUiMode = "custom" | "gawdy";

export const DEFAULT_MODE_STORAGE_KEY = "g95-ui-mode";

export type GawdyModeContextValue = {
  mode: GawdyUiMode;
  isGawdy: boolean;
  setMode: (mode: GawdyUiMode) => void;
  toggle: () => void;
};

const GawdyModeContext = createContext<GawdyModeContextValue | null>(null);

/** The current UI mode from the nearest `<GawdyModeProvider>`, or null outside one. */
export function useGawdyMode(): GawdyModeContextValue | null {
  return useContext(GawdyModeContext);
}

/** Puts `g95` (and `g95-dark` for the dark Gawdy theme) on `<body>` only while `active`. */
function useGawdyPage(active: boolean, theme: GawdyTheme): void {
  useGawdyBody(active);
  useIsoLayoutEffect(() => {
    if (!active) return;
    document.body.classList.toggle("g95-dark", theme === "dark");
    return () => document.body.classList.remove("g95-dark");
  }, [active, theme]);
}

export type GawdyModeOptions = {
  /** Controlled mode. */
  mode?: GawdyUiMode;
  onModeChange?: (mode: GawdyUiMode) => void;
  /** Mode until the user flips the switch. `system`: dark OS → Gawdy95, light OS → your UI. Default `custom`. */
  defaultMode?: GawdyUiMode | "system";
  /** localStorage key for the user's pick; `null` to not remember it. Default `g95-ui-mode`. */
  storageKey?: string | null;
  /** How Gawdy95 looks on the dark side of the switch. Default `dark`. A `<ThemeSwitch>` inside can still change it. */
  defaultGawdyTheme?: GawdyTheme;
  /** localStorage key for the Gawdy light/dark pick; `null` to not remember it. Default `g95-theme`. */
  gawdyThemeStorageKey?: string | null;
};

function useGawdyModeState({
  mode,
  onModeChange,
  defaultMode = "custom",
  storageKey = DEFAULT_MODE_STORAGE_KEY,
  defaultGawdyTheme = "dark",
  gawdyThemeStorageKey = DEFAULT_THEME_STORAGE_KEY,
}: GawdyModeOptions) {
  const [stored, setStored] = usePreference<GawdyUiMode>({ whenLight: "custom", whenDark: "gawdy", defaultValue: defaultMode, storageKey });
  const [gawdyTheme, setGawdyTheme] = useGawdyTheme({ defaultTheme: defaultGawdyTheme, storageKey: gawdyThemeStorageKey });
  const current = mode ?? stored;

  const modeCtx = useMemo<GawdyModeContextValue>(() => {
    const setMode = (next: GawdyUiMode) => {
      if (mode === undefined) setStored(next);
      onModeChange?.(next);
    };
    return { mode: current, isGawdy: current === "gawdy", setMode, toggle: () => setMode(current === "gawdy" ? "custom" : "gawdy") };
  }, [current, mode, onModeChange, setStored]);

  const themeCtx = useMemo(() => ({ theme: gawdyTheme, setTheme: setGawdyTheme }), [gawdyTheme, setGawdyTheme]);

  return { modeCtx, themeCtx };
}

export type GawdyModeProviderProps = GawdyModeOptions & { children?: ReactNode };

/**
 * Switches the whole page between your own UI and Gawdy95. In Gawdy mode it puts `g95` (plus `g95-dark` by default)
 * on `<body>`; in custom mode it removes them, so your styles are untouched. Pick what to render with
 * `<GawdyMode custom={…} gawdy={…} />` or `useGawdyMode()`. No `<GawdyRoot>` is needed inside.
 */
export function GawdyModeProvider({ children, ...options }: GawdyModeProviderProps) {
  const { modeCtx, themeCtx } = useGawdyModeState(options);
  useGawdyPage(modeCtx.isGawdy, themeCtx.theme);
  return (
    <GawdyModeContext.Provider value={modeCtx}>
      <GawdyThemeContext.Provider value={themeCtx}>{children}</GawdyThemeContext.Provider>
    </GawdyModeContext.Provider>
  );
}

/** Renders `custom` or `gawdy` depending on the current mode. */
export function GawdyMode({ custom, gawdy }: { custom: ReactNode; gawdy: ReactNode }) {
  const ctx = useGawdyMode();
  return <>{ctx?.isGawdy ? gawdy : custom}</>;
}

export type GawdyModeSwitchProps = Omit<SwitchProps, "checked" | "defaultChecked" | "onChange" | "thumb" | "onText" | "offText" | "label"> &
  Omit<GawdyModeOptions, "onModeChange"> & {
    onChange?: (mode: GawdyUiMode) => void;
    /** Visible label. Default "Gawdy 95"; pass `null` to hide it (the accessible name stays "Gawdy 95"). */
    label?: ReactNode | null;
    /** Thumb icon on the light side (your UI). */
    customIcon?: ReactNode;
    /** Thumb icon on the dark side (Gawdy95). */
    gawdyIcon?: ReactNode;
  };

/**
 * A Gawdy95 light/dark switch whose light side is your own UI and whose dark side is Gawdy95. Checked means Gawdy.
 * Inside a `<GawdyModeProvider>` it drives the provider. On its own it switches `<body>` itself.
 * Render it somewhere both UIs share (a top bar) so it keeps focus when the page swaps.
 */
export const GawdyModeSwitch = forwardRef<HTMLButtonElement, GawdyModeSwitchProps>(function GawdyModeSwitch(
  { mode, onChange, defaultMode, storageKey, defaultGawdyTheme, gawdyThemeStorageKey, label = "Gawdy 95", customIcon = "☀️", gawdyIcon = "🌙", className, ...rest },
  ref,
) {
  const ctx = useGawdyMode();
  const standalone = useGawdyModeState({ mode, onModeChange: onChange, defaultMode, storageKey, defaultGawdyTheme, gawdyThemeStorageKey });
  const ownsPage = !ctx && mode === undefined;
  useGawdyPage(ownsPage && standalone.modeCtx.isGawdy, standalone.themeCtx.theme);

  const current = mode ?? ctx?.mode ?? standalone.modeCtx.mode;
  const change = (gawdy: boolean) => {
    const next: GawdyUiMode = gawdy ? "gawdy" : "custom";
    if (mode !== undefined) onChange?.(next);
    else if (ctx) {
      ctx.setMode(next);
      onChange?.(next);
    } else standalone.modeCtx.setMode(next);
  };

  return (
    <Switch
      ref={ref}
      className={cx("g95-switch--theme", "g95-switch--mode", className)}
      checked={current === "gawdy"}
      onChange={change}
      thumb={(gawdy) => (gawdy ? gawdyIcon : customIcon)}
      onText={customIcon}
      offText={gawdyIcon}
      label={label ?? undefined}
      aria-label={label === null ? "Gawdy 95" : undefined}
      {...rest}
    />
  );
});

export type GawdyUiPosition = "custom" | "light" | "dark";

export type GawdyUiSwitchProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & {
  size?: "sm" | "md";
  /**
   * Show a stop for your own UI. Default true. With `false` the switch only offers Gawdy light and Gawdy dark;
   * while your UI is showing, neither stop is selected and the thumb is hidden, so one click enters either theme.
   * Provide another way back to your UI (for example a "Back to Classic" item in a Gawdy menu).
   */
  includeCustom?: boolean;
  /** Accessible name of the whole control. Default "Interface". */
  label?: string;
  /** Visible text next to the track, also the group's description. Defaults to the current UI's name; `null` hides it. */
  caption?: ReactNode | null;
  /** Name of your own UI. Default "Classic". */
  customLabel?: string;
  lightLabel?: string;
  darkLabel?: string;
  customIcon?: ReactNode;
  lightIcon?: ReactNode;
  darkIcon?: ReactNode;
  onChange?: (position: GawdyUiPosition) => void;
};

/**
 * A Win95 stop slider inside a `<GawdyModeProvider>`: your own UI, Gawdy95 light, or Gawdy95 dark
 * (or just the two Gawdy themes with `includeCustom={false}`).
 * It is a radio group: arrow keys move between stops, Home and End jump to the ends.
 */
export function GawdyUiSwitch({
  size = "md",
  includeCustom = true,
  label = "Interface",
  caption,
  customLabel = "Classic",
  lightLabel = "Gawdy 95 light",
  darkLabel = "Gawdy 95 dark",
  customIcon = "🖥️",
  lightIcon = "☀️",
  darkIcon = "🌙",
  onChange,
  className,
  style,
  ...rest
}: GawdyUiSwitchProps) {
  const mode = useGawdyMode();
  const theme = useContext(GawdyThemeContext);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const captionId = useId();
  if (!mode || !theme) throw new Error("GawdyUiSwitch must be rendered inside a <GawdyModeProvider>.");

  const all: { pos: GawdyUiPosition; name: string; icon: ReactNode }[] = [
    { pos: "custom", name: customLabel, icon: customIcon },
    { pos: "light", name: lightLabel, icon: lightIcon },
    { pos: "dark", name: darkLabel, icon: darkIcon },
  ];
  const stops = includeCustom ? all : all.slice(1);
  const current: GawdyUiPosition = mode.isGawdy ? theme.theme : "custom";
  const index = stops.findIndex((s) => s.pos === current);
  const currentName = all.find((s) => s.pos === current)!.name;

  const select = (pos: GawdyUiPosition) => {
    if (pos === "custom") mode.setMode("custom");
    else {
      theme.setTheme(pos);
      mode.setMode("gawdy");
    }
    onChange?.(pos);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = stops.length;
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index < 0 ? 0 : (index + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index < 0 ? n - 1 : (index - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === undefined) return;
    e.preventDefault();
    select(stops[next].pos);
    refs.current[next]?.focus();
  };

  const shown = caption === undefined ? currentName : caption;
  const focusable = index < 0 ? 0 : index;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-describedby={shown !== null ? captionId : undefined}
      className={cx("g95-switch", "g95-switch--tri", size === "sm" && "g95-switch--sm", className)}
      data-pos={current}
      data-unset={index < 0 ? "" : undefined}
      style={{ ...style, ["--n" as string]: String(stops.length), ["--i" as string]: String(Math.max(index, 0)) }}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <span className="g95-switch__track">
        {stops.map((s, i) => (
          <button
            key={s.pos}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            className="g95-switch__stop"
            aria-checked={i === index}
            aria-label={s.name}
            title={s.name}
            tabIndex={i === focusable ? 0 : -1}
            onClick={() => select(s.pos)}
          >
            {s.icon}
          </button>
        ))}
        {index >= 0 && <span className="g95-switch__thumb" aria-hidden="true">{stops[index].icon}</span>}
      </span>
      {shown !== null && <span className="g95-switch__label" id={captionId}>{shown}</span>}
    </div>
  );
}
