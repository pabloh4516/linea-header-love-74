import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

const SIMPLE_VAR_MAP: Record<string, { prop: string; unit: string }> = {
  theme_nav_height: { prop: "--nav-height", unit: "px" },
  theme_nav_logo_height: { prop: "--nav-logo-height", unit: "px" },
  theme_statusbar_height: { prop: "--status-bar-height", unit: "px" },
  theme_statusbar_font_size: { prop: "--status-bar-font-size", unit: "px" },
  theme_spacing_section: { prop: "--section-spacing", unit: "px" },
  theme_max_width: { prop: "--max-width", unit: "px" },
  theme_button_radius: { prop: "--button-radius", unit: "px" },
  theme_button_height: { prop: "--button-height", unit: "px" },
  theme_button_font_size: { prop: "--button-font-size", unit: "px" },
  theme_button_letter_spacing: { prop: "--button-letter-spacing", unit: "em" },
  theme_button_font_weight: { prop: "--button-font-weight", unit: "" },
  theme_card_gap: { prop: "--card-gap", unit: "px" },
  theme_card_columns_desktop: { prop: "--card-columns-desktop", unit: "" },
  theme_card_columns_mobile: { prop: "--card-columns-mobile", unit: "" },
  theme_cart_width: { prop: "--cart-width", unit: "px" },
  theme_heading_weight: { prop: "--heading-weight", unit: "" },
  theme_body_weight: { prop: "--body-weight", unit: "" },
  theme_letter_spacing_editorial: { prop: "--letter-spacing-editorial", unit: "em" },
  theme_transition_speed: { prop: "--transition-speed", unit: "ms" },
  theme_hover_scale: { prop: "--hover-scale", unit: "" },
  theme_overlay_opacity: { prop: "--overlay-opacity", unit: "" },
};

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
          const bgH = settings.theme_bg_h, bgS = settings.theme_bg_s, bgL = settings.theme_bg_l;
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

  // Simple CSS variable mappings
  for (const [key, { prop, unit }] of Object.entries(SIMPLE_VAR_MAP)) {
    if (settings[key]) {
      set(prop, `${settings[key]}${unit}`);
    }
  }

  // Border radius
  if (settings.theme_border_radius) {
    set("--radius", `${settings.theme_border_radius}rem`);
  }

  // Font families
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
  if (fontDisplay) set("--font-display", `'${fontDisplay}', sans-serif`);
  if (fontBody) {
    set("--font-body", `'${fontBody}', sans-serif`);
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
  const queryClient = useQueryClient();
  const isAdmin = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!settings || isAdmin) return;
    applyTheme(settings);
  }, [settings, isAdmin]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "theme-preview-update" && e.data.theme) {
        const themeData = e.data.theme as Record<string, string>;
        applyTheme(themeData);

        // Update the site-settings query cache so components using
        // useSiteSettings / useThemeConfig re-render with new values
        // (e.g. footer layout, card columns, pdp layout, etc.)
        queryClient.setQueryData<Record<string, string>>(["site-settings"], (old) => {
          if (!old) return themeData;
          return { ...old, ...themeData };
        });
      }
      if (e.data?.type === "theme-content-refresh") {
        queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
        queryClient.invalidateQueries({ queryKey: ["page-template"] });
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
  }, [queryClient]);

  return null;
};

export default ThemeApplicator;
