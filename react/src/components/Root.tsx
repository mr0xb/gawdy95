import { useEffect, useLayoutEffect, useMemo, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../cx";
import { GawdyThemeContext, useGawdyTheme, type GawdyTheme, type UseGawdyThemeOptions } from "./Theme";

export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

let bodyUsers = 0;

/** Adds the `g95` class to `<body>` while mounted: desktop background, base font and the scoped reset. */
export function useGawdyBody(enabled = true): void {
  useIsoLayoutEffect(() => {
    if (!enabled) return;
    bodyUsers += 1;
    document.body.classList.add("g95");
    return () => {
      bodyUsers -= 1;
      if (bodyUsers === 0) document.body.classList.remove("g95");
    };
  }, [enabled]);
}

export type GawdyRootProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * `body` (default) puts `g95` on `<body>` for the full desktop look.
   * `scope` puts it on a wrapping `<div>` instead, so Gawdy95 can live inside a larger app.
   */
  mode?: "body" | "scope";
  /** Controlled theme. Leave it out and the root keeps the theme itself (see `defaultTheme`). */
  theme?: GawdyTheme;
  onThemeChange?: (theme: GawdyTheme) => void;
  /** Theme until the user picks one with a `<ThemeSwitch>`. `system` follows the OS. Default `light`. */
  defaultTheme?: UseGawdyThemeOptions["defaultTheme"];
  /** localStorage key for the user's pick; `null` to not remember it. Default `g95-theme`. */
  themeStorageKey?: string | null;
  children?: ReactNode;
};

export function GawdyRoot({ mode = "body", theme, onThemeChange, defaultTheme, themeStorageKey, className, children, ...rest }: GawdyRootProps) {
  useGawdyBody(mode === "body");
  const [stored, setStored] = useGawdyTheme({ defaultTheme, storageKey: themeStorageKey });
  const current = theme ?? stored;

  const ctx = useMemo(
    () => ({
      theme: current,
      setTheme: (next: GawdyTheme) => {
        if (theme === undefined) setStored(next);
        onThemeChange?.(next);
      },
    }),
    [current, theme, setStored, onThemeChange],
  );

  useIsoLayoutEffect(() => {
    if (mode !== "body") return;
    document.body.classList.toggle("g95-dark", current === "dark");
    return () => document.body.classList.remove("g95-dark");
  }, [mode, current]);

  return (
    <GawdyThemeContext.Provider value={ctx}>
      {mode === "body" ? (
        children
      ) : (
        <div className={cx("g95", current === "dark" && "g95-dark", className)} {...rest}>
          {children}
        </div>
      )}
    </GawdyThemeContext.Provider>
  );
}
