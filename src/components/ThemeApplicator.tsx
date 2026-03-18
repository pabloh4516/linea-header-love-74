import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// ─── Hex → HSL converter ──────────────────────────────────
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  if (!hex || !hex.startsWith("#")) return null;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16);
  } else return null;
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ─── Legacy HSL color groups (linea-minimal) ───────────────
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

// ─── New HEX color map (ecommerce-br) ─────────────────────
const HEX_COLOR_MAP: Record<string, { cssVar: string; fgVar?: string; extras?: string[] }> = {
  theme_color_primary:           { cssVar: "--primary", fgVar: "--primary-foreground" },
  theme_color_background:        { cssVar: "--background", extras: ["--card", "--popover"] },
  theme_color_foreground:        { cssVar: "--foreground", extras: ["--card-foreground", "--popover-foreground", "--ring"] },
  theme_color_accent:            { cssVar: "--accent" },
  theme_color_muted:             { cssVar: "--muted", fgVar: "--muted-foreground" },
  theme_color_border:            { cssVar: "--border", extras: ["--input"] },
  theme_color_error:             { cssVar: "--destructive" },
  theme_announcement_bg:         { cssVar: "--status-bar" },
  theme_announcement_text_color: { cssVar: "--status-bar-foreground" },
  theme_header_bg:               { cssVar: "--nav-background" },
  theme_header_text_color:       { cssVar: "--nav-foreground" },
  theme_footer_bg:               { cssVar: "--footer-bg" },
  theme_footer_text:             { cssVar: "--footer-fg" },
};

// ─── Legacy simple CSS var map (linea-minimal) ─────────────
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

// ─── New simple CSS var map (ecommerce-br) ─────────────────
const NEW_SIMPLE_MAP: Record<string, { prop: string; unit: string }> = {
  theme_section_spacing:            { prop: "--section-spacing", unit: "px" },
  theme_section_spacing_mobile:     { prop: "--section-spacing-mobile", unit: "px" },
  theme_layout_custom_width:        { prop: "--max-width", unit: "px" },
  theme_btn_border_radius:          { prop: "--button-radius", unit: "px" },
  theme_btn_height:                 { prop: "--button-height", unit: "px" },
  theme_btn_font_size:              { prop: "--button-font-size", unit: "px" },
  theme_btn_letter_spacing:         { prop: "--button-letter-spacing", unit: "px" },
  theme_btn_font_weight:            { prop: "--button-font-weight", unit: "" },
  theme_border_radius_global:       { prop: "--radius", unit: "px" },
  theme_announcement_height:        { prop: "--status-bar-height", unit: "px" },
  theme_announcement_font_size:     { prop: "--status-bar-font-size", unit: "px" },
  theme_header_height_mobile:       { prop: "--nav-height", unit: "px" },
  theme_logo_width:                 { prop: "--nav-logo-height", unit: "px" },
  theme_collection_gap:             { prop: "--card-gap", unit: "px" },
  theme_collection_columns_desktop: { prop: "--card-columns-desktop", unit: "" },
  theme_collection_columns_mobile:  { prop: "--card-columns-mobile", unit: "" },
  theme_cart_drawer_width:          { prop: "--cart-width", unit: "px" },
  theme_font_weight_heading:        { prop: "--heading-weight", unit: "" },
  theme_font_weight_body:           { prop: "--body-weight", unit: "" },
};

const applyTheme = (settings: Record<string, string>) => {
  const root = document.documentElement;
  const set = (prop: string, val: string) => root.style.setProperty(prop, val);

  // ── 1. Legacy HSL color groups ──────────────────────────
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

  // ── 2. New HEX color groups (ecommerce-br) ─────────────
  for (const [key, mapping] of Object.entries(HEX_COLOR_MAP)) {
    const hex = settings[key];
    if (hex) {
      const hsl = hexToHsl(hex);
      if (hsl) {
        const hslVal = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        set(mapping.cssVar, hslVal);
        if (mapping.fgVar) {
          if (key === "theme_color_primary") {
            const bgHex = settings.theme_color_background;
            const bgHsl = bgHex ? hexToHsl(bgHex) : null;
            if (bgHsl) set(mapping.fgVar, `${bgHsl.h} ${bgHsl.s}% ${bgHsl.l}%`);
          } else if (key === "theme_color_muted") {
            set(mapping.fgVar, `${hsl.h} ${hsl.s}% 45%`);
          }
        }
        if (mapping.extras) {
          for (const extra of mapping.extras) set(extra, hslVal);
        }
      }
    }
  }

  // ── 3. Legacy simple CSS variables ─────────────────────
  for (const [key, { prop, unit }] of Object.entries(SIMPLE_VAR_MAP)) {
    if (settings[key]) {
      set(prop, `${settings[key]}${unit}`);
    }
  }

  // ── 4. New simple CSS variables (ecommerce-br) ─────────
  for (const [key, { prop, unit }] of Object.entries(NEW_SIMPLE_MAP)) {
    if (settings[key]) {
      set(prop, `${settings[key]}${unit}`);
    }
  }

  // Border radius (legacy)
  if (settings.theme_border_radius) {
    set("--radius", `${settings.theme_border_radius}rem`);
  }

  // ── 5. Font families ───────────────────────────────────
  const fontDisplay = settings.theme_font_display;
  const fontBody = settings.theme_font_body;
  const fontHeading = settings.theme_font_heading;

  // Collect all fonts to load
  const fontsToLoad: string[] = [];
  if (fontDisplay) fontsToLoad.push(fontDisplay);
  if (fontBody) fontsToLoad.push(fontBody);
  if (fontHeading && !fontsToLoad.includes(fontHeading)) fontsToLoad.push(fontHeading);

  if (fontsToLoad.length > 0) {
    const existingLink = document.getElementById("theme-google-fonts");
    if (existingLink) existingLink.remove();
    const link = document.createElement("link");
    link.id = "theme-google-fonts";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f.replace(/ /g, "+")}:wght@200;300;400;500;600;700`).join("&")}&display=swap`;
    document.head.appendChild(link);
  }

  // Apply display/heading font
  const displayFont = fontDisplay || fontHeading;
  if (displayFont) set("--font-display", `'${displayFont}', sans-serif`);

  // Apply body font
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
