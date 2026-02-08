import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "fresh-mint" | "boreal";

const THEME_CLASSES: Record<Theme, string[]> = {
  light: [],
  dark: ["dark"],
  "fresh-mint": ["fresh-mint"],
  boreal: ["boreal"],
};

const ALL_THEME_CLASSES = ["dark", "fresh-mint", "boreal"];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme?: () => void;
  switchable: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

const THEME_ORDER: Theme[] = ["dark", "light", "fresh-mint", "boreal"];

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      if (stored && THEME_ORDER.includes(stored as Theme)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    ALL_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    const toAdd = THEME_CLASSES[theme] || [];
    toAdd.forEach(cls => root.classList.add(cls));

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const isDark = theme === "dark" || theme === "boreal";

  const setTheme = (t: Theme) => {
    if (switchable) setThemeState(t);
  };

  const toggleTheme = switchable
    ? () => {
        setThemeState(prev => {
          const idx = THEME_ORDER.indexOf(prev);
          return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
        });
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, switchable, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
