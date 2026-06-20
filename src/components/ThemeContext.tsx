import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Theme, ThemeContextValue, ThemeProviderProps } from '../types/app';

const THEMES: Theme[] = ['midnight', 'light', 'obsidian', 'nebula', 'solar', 'relux'];
const STORAGE_KEY = 'savannah-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function themeColorScheme(theme: Theme) {
  return theme === 'light' || theme === 'solar' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('midnight');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && THEMES.includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = themeColorScheme(theme);

    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = themeColorScheme(theme);
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const setTheme = useCallback((nextTheme: Theme) => setThemeState(nextTheme), []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
      return THEMES[nextIndex];
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, cycleTheme }), [theme, setTheme, cycleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'midnight',
      setTheme: () => {},
      cycleTheme: () => {},
    };
  }
  return context;
}
