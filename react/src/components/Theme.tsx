import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type GawdyTheme = "light" | "dark";

export type GawdyThemeContextValue = { theme: GawdyTheme; setTheme: (theme: GawdyTheme) => void };

export const GawdyThemeContext = createContext<GawdyThemeContextValue | null>(null);

/** The theme from the nearest `<GawdyRoot>` or `<GawdyModeProvider>`, or null outside one. */
export function useGawdyThemeContext(): GawdyThemeContextValue | null {
  return useContext(GawdyThemeContext);
}

export const DEFAULT_THEME_STORAGE_KEY = "g95-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;
}

/**
 * A two-value preference that is remembered in localStorage once picked, and until then is either a fixed
 * default or (with `system`) follows `prefers-color-scheme` live: `dark` maps to `whenDark`, light to `whenLight`.
 */
export function usePreference<T extends string>(
  options: { whenLight: T; whenDark: T; defaultValue: T | "system"; storageKey: string | null },
): [T, (value: T) => void] {
  const { whenLight, whenDark, defaultValue, storageKey } = options;
  const fromSystem = () => (systemPrefersDark() ? whenDark : whenLight);

  const [picked, setPicked] = useState<T | null>(() => {
    if (!storageKey) return null;
    try {
      const v = localStorage.getItem(storageKey);
      return v === whenLight || v === whenDark ? (v as T) : null;
    } catch {
      return null;
    }
  });
  const [fallback, setFallback] = useState<T>(() => (defaultValue === "system" ? fromSystem() : defaultValue));

  useEffect(() => {
    if (defaultValue !== "system") {
      setFallback(defaultValue);
      return;
    }
    if (picked !== null || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => setFallback(mq.matches ? whenDark : whenLight);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [defaultValue, picked, whenDark, whenLight]);

  const set = useCallback(
    (value: T) => {
      setPicked(value);
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        // Storage unavailable: the choice lasts for this page load.
      }
    },
    [storageKey],
  );

  return [picked ?? fallback, set];
}

export type UseGawdyThemeOptions = {
  /** Used until the user picks one. `system` follows `prefers-color-scheme`, live. Default `light`. */
  defaultTheme?: GawdyTheme | "system";
  /** localStorage key that remembers the user's pick. `null` disables persistence. */
  storageKey?: string | null;
};

/** Gawdy95 light/dark state that remembers the user's pick, and can follow the OS setting until they make one. */
export function useGawdyTheme({ defaultTheme = "light", storageKey = DEFAULT_THEME_STORAGE_KEY }: UseGawdyThemeOptions = {}): [GawdyTheme, (theme: GawdyTheme) => void] {
  return usePreference<GawdyTheme>({ whenLight: "light", whenDark: "dark", defaultValue: defaultTheme, storageKey });
}
