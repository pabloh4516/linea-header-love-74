import { useEffect } from "react";
import { useActiveTheme } from "@/hooks/useThemes";
import { themeRegistry } from "@/theme-engine";

export const useActiveThemeSync = () => {
  const { data: activeTheme } = useActiveTheme();

  useEffect(() => {
    if (activeTheme?.slug) {
      themeRegistry.setActive(activeTheme.slug);
    }
  }, [activeTheme?.slug]);

  return activeTheme;
};
