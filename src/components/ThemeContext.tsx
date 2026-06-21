import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Theme, ThemeContextValue, ThemeProviderProps } from '../types/app';

const THEMES: Theme[] = ['dark', 'light'];
const STORAGE_KEY = 'savannah-theme';

/** Map legacy stored theme names to dark | light. */
function normalizeTheme(stored: string | null): Theme {
  if (stored === 'light') return 'light';
  if (stored === 'solar') return 'light';
  return 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setThemeState(normalizeTheme(stored));
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.content = theme;
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const setTheme = useCallback((nextTheme: Theme) => setThemeState(nextTheme), []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, setTheme, cycleTheme }), [theme, setTheme, cycleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      setTheme: () => {},
      cycleTheme: () => {},
    };
  }
  return context;
}
