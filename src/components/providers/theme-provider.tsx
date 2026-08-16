"use client";

import * as React from "react";

import { THEME_STORAGE_KEY } from "@/components/providers/theme-script";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  attribute?: "class" | string;
  disableTransitionOnChange?: boolean;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) return getSystemTheme();
  return theme === "dark" ? "dark" : "light";
}

function applyThemeClass(
  resolved: ResolvedTheme,
  attribute: string,
  disableTransitionOnChange: boolean
) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const apply = () => {
    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }
    root.style.colorScheme = resolved;
  };

  if (!disableTransitionOnChange) {
    apply();
    return;
  }

  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  );
  document.head.appendChild(style);
  apply();
  void window.getComputedStyle(document.body).opacity;
  requestAnimationFrame(() => {
    style.parentNode?.removeChild(style);
  });
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = THEME_STORAGE_KEY,
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>("light");

  const apply = React.useCallback(
    (nextTheme: Theme) => {
      const resolved = resolveTheme(nextTheme, enableSystem);
      setResolvedTheme(resolved);
      applyThemeClass(resolved, attribute, disableTransitionOnChange);
    },
    [attribute, disableTransitionOnChange, enableSystem]
  );

  useIsomorphicLayoutEffect(() => {
    let initial = defaultTheme;
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (
        storedTheme === "light" ||
        storedTheme === "dark" ||
        storedTheme === "system"
      ) {
        initial = storedTheme;
      }
    } catch {
      initial = defaultTheme;
    }
    setThemeState(initial);
    apply(initial);
  }, [apply, defaultTheme, storageKey]);

  useIsomorphicLayoutEffect(() => {
    if (!(theme === "system" && enableSystem)) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => apply("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [apply, enableSystem, theme]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      apply(nextTheme);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // no-op when storage is unavailable
      }
    },
    [apply, storageKey]
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
