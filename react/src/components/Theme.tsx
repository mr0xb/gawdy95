import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type GawdyTheme = "light" | "dark";

export type GawdyThemeContextValue = { theme: GawdyTheme; setTheme: (theme: GawdyTheme) => void };

export const GawdyThemeContext = createContext<GawdyThemeContextValue | null>(null);

/** The theme from the nearest `<GawdyRoot>`, or null outside one. */
export function useGawdyThemeContext(): GawdyThemeContextValue | null {
  return useContext(GawdyThemeContext);
}

export const DEFAULT_THEME_STORAGE_KEY = "g95-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function systemTheme(): GawdyTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function readStored(key: string | null): GawdyTheme | null {
  if (!key) return null;
  try {
    const v = localStorage.getItem(key);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export type UseGawdyThemeOptions = {
  /** Used until the user picks one. `system` follows `prefers-color-scheme`, live. Default `light`. */
  defaultTheme?: GawdyTheme | "system";
  /** localStorage key that remembers the user's pick. `null` disables persistence. */
  storageKey?: string | null;
};

/** Theme state that remembers the user's pick, and can follow the OS setting until they make one. */
export function useGawdyTheme({ defaultTheme = "light", storageKey = DEFAULT_THEME_STORAGE_KEY }: UseGawdyThemeOptions = {}): [GawdyTheme, (theme: GawdyTheme) => void] {
  const fallback = () => (defaultTheme === "system" ? systemTheme() : defaultTheme);
  const [picked, setPicked] = useState<GawdyTheme | null>(() => readStored(storageKey));
  const [fallbackTheme, setFallbackTheme] = useState<GawdyTheme>(fallback);

  useEffect(() => {
    if (defaultTheme !== "system" || picked !== null || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => setFallbackTheme(mq.matches ? "dark" : "light");
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [defaultTheme, picked]);

  const setTheme = useCallback(
    (theme: GawdyTheme) => {
      setPicked(theme);
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Storage unavailable: the choice lasts for this page load.
      }
    },
    [storageKey],
  );

  return [picked ?? fallbackTheme, setTheme];
}
