import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useActiveTheme } from "@/hooks/useThemes";
import { themeRegistry } from "@/theme-engine";

interface ThemeSyncContextType {
  activeThemeId: string | null;
  isReady: boolean;
}

const ThemeSyncContext = createContext<ThemeSyncContextType>({ activeThemeId: null, isReady: false });

export const useThemeSync = () => useContext(ThemeSyncContext);

export const ThemeSyncProvider = ({ children }: { children: ReactNode }) => {
  const { data: activeTheme, isLoading } = useActiveTheme();
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (activeTheme?.slug) {
      themeRegistry.setActive(activeTheme.slug);
      setActiveThemeId(activeTheme.slug);
      setIsReady(true);
    } else if (!isLoading) {
      setActiveThemeId(themeRegistry.getActive()?.id || null);
      setIsReady(true);
    }
  }, [activeTheme?.slug, isLoading]);

  return (
    <ThemeSyncContext.Provider value={{ activeThemeId, isReady }}>
      {children}
    </ThemeSyncContext.Provider>
  );
};

// Keep backward compatibility
export const useActiveThemeSync = () => {
  const ctx = useContext(ThemeSyncContext);
  return ctx;
};
