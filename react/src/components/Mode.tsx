import { createContext, forwardRef, useContext, useMemo, type ReactNode } from "react";
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
