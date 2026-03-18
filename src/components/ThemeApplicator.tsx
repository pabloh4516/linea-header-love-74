import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Reads saved theme settings from the database and applies them
 * as CSS custom properties on the document root element.
 * This makes the theme editor changes take effect on the live store.
 */
const THEME_CSS_MAP: Record<string, (value: string, set: (prop: string, val: string) => void) => void> = {
  // Core colors
  theme_primary_h: (v, s) => s("--primary", `${v} VAR_S VAR_L`),
  theme_bg_h: (v, s) => s("--background", `${v} VAR_S VAR_L`),
  // We handle color groups specially below
};

// Color groups: setting key prefix → CSS variable name
const COLOR_GROUPS = [
  { prefix: "theme_primary", cssVar: "--primary", fgVar: "--primary-foreground" },
  { prefix: "theme_bg", cssVar: "--background", cardVar: "--card", popoverVar: "--popover" },
  { prefix: "theme_fg", cssVar: "--foreground", cardFgVar: "--card-foreground", popoverFgVar: "--popover-foreground", ringVar: "--ring" },
  { prefix: "theme_accent", cssVar: "--accent" },
  { prefix: "theme_muted", cssVar: "--muted", fgVar: "--muted-foreground" },
  { prefix: "theme_border", cssVar: "--border", inputVar: "--input" },
  { prefix: "theme_destructive", cssVar: "--destructive" },
  { prefix: "theme_statusbar_bg", cssVar: "--status-bar" },
  { prefix: "theme_statusbar_fg", cssVar: "--status-bar-foreground" },
  { prefix: "theme_nav_bg", cssVar: "--nav-background" },
  { prefix: "theme_nav_fg", cssVar: "--nav-foreground" },
  { prefix: "theme_footer_bg", cssVar: "--footer-bg" },
  { prefix: "theme_footer_fg", cssVar: "--footer-fg" },
];

const applyTheme = (settings: Record<string, string>) => {
  const root = document.documentElement;
  const set = (prop: string, val: string) => root.style.setProperty(prop, val);

  // Apply color groups
  for (const group of COLOR_GROUPS) {
    const h = settings[`${group.prefix}_h`];
    const s = settings[`${group.prefix}_s`];
    const l = settings[`${group.prefix}_l`];
    if (h && s && l) {
      const hslVal = `${h} ${s}% ${l}%`;
      set(group.cssVar, hslVal);

      if ("fgVar" in group && group.fgVar) {
        if (group.prefix === "theme_primary") {
          const bgH = settings.theme_bg_h;
          const bgS = settings.theme_bg_s;
          const bgL = settings.theme_bg_l;
          if (bgH && bgS && bgL) set(group.fgVar, `${bgH} ${bgS}% ${bgL}%`);
        } else if (group.prefix === "theme_muted") {
          set(group.fgVar, `${h} ${s}% 45%`);
        }
      }
      if ("cardVar" in group && group.cardVar) set(group.cardVar, hslVal);
      if ("popoverVar" in group && group.popoverVar) set(group.popoverVar, hslVal);
      if ("cardFgVar" in group && group.cardFgVar) set(group.cardFgVar, hslVal);
      if ("popoverFgVar" in group && group.popoverFgVar) set(group.popoverFgVar, hslVal);
      if ("ringVar" in group && group.ringVar) set(group.ringVar, hslVal);
      if ("inputVar" in group && group.inputVar) set(group.inputVar, hslVal);
    }
  }

  // Border radius
  if (settings.theme_border_radius) {
    set("--radius", `${settings.theme_border_radius}rem`);
  }

  // Typography - load Google Fonts and apply
  const fontDisplay = settings.theme_font_display;
  const fontBody = settings.theme_font_body;
  if (fontDisplay || fontBody) {
    const fonts = [fontDisplay, fontBody].filter(Boolean);
    const existingLink = document.getElementById("theme-google-fonts");
    if (existingLink) existingLink.remove();
    const link = document.createElement("link");
    link.id = "theme-google-fonts";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f!.replace(/ /g, "+")}:wght@200;300;400;500;600;700`).join("&")}&display=swap`;
    document.head.appendChild(link);
  }
  if (fontBody) {
    root.style.fontFamily = `'${fontBody}', sans-serif`;
  }

  // Custom CSS
  if (settings.theme_custom_css) {
    const existingStyle = document.getElementById("theme-custom-css");
    if (existingStyle) existingStyle.remove();
    const style = document.createElement("style");
    style.id = "theme-custom-css";
    style.textContent = settings.theme_custom_css;
    document.head.appendChild(style);
  }
};

const ThemeApplicator = () => {
  const { data: settings } = useSiteSettings();
  const isAdmin = window.location.pathname.startsWith("/admin");

  // Apply saved settings from database — only on storefront pages
  useEffect(() => {
    if (!settings || isAdmin) return;
    applyTheme(settings);
  }, [settings, isAdmin]);

  // Listen for real-time preview updates from the theme editor via postMessage
  // (this runs inside the iframe preview, which is always "/" — not /admin)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "theme-preview-update" && e.data.theme) {
        applyTheme(e.data.theme);
      }
      if (e.data?.type === "theme-enable-inline-edit" && e.data.script) {
        if (!document.getElementById("theme-inline-edit")) {
          const script = document.createElement("script");
          script.id = "theme-inline-edit";
          script.textContent = e.data.script;
          document.body.appendChild(script);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
};

export default ThemeApplicator;
