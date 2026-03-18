import { useState, useRef, useCallback, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Save, Monitor, Smartphone, Tablet, RotateCcw, Palette, Type, Layout, Square,
  ChevronLeft, ChevronRight, Minus, Image as ImageIcon, ShoppingBag, CreditCard,
  Globe, Menu, AlignCenter, Layers, Eye, ArrowUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Font Options ──────────────────────────────────────────
const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans" },
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lora", label: "Lora" },
  { value: "Raleway", label: "Raleway" },
  { value: "Libre Baskerville", label: "Libre Baskerville" },
  { value: "Poppins", label: "Poppins" },
  { value: "Source Serif 4", label: "Source Serif 4" },
  { value: "EB Garamond", label: "EB Garamond" },
  { value: "Josefin Sans", label: "Josefin Sans" },
];

// ─── All theme keys with defaults ──────────────────────────
const DEFAULTS: Record<string, string> = {
  // Colors
  theme_primary_h: "30", theme_primary_s: "5", theme_primary_l: "8",
  theme_bg_h: "30", theme_bg_s: "10", theme_bg_l: "98",
  theme_fg_h: "30", theme_fg_s: "5", theme_fg_l: "8",
  theme_accent_h: "35", theme_accent_s: "30", theme_accent_l: "90",
  theme_muted_h: "30", theme_muted_s: "8", theme_muted_l: "95",
  theme_border_h: "30", theme_border_s: "8", theme_border_l: "88",
  theme_destructive_h: "0", theme_destructive_s: "84", theme_destructive_l: "60",
  // Typography
  theme_font_display: "DM Sans",
  theme_font_body: "DM Sans",
  theme_font_size_base: "16",
  theme_heading_weight: "300",
  theme_body_weight: "300",
  theme_letter_spacing_editorial: "0.05",
  // Layout
  theme_border_radius: "0.375",
  theme_spacing_section: "96",
  theme_max_width: "1440",
  // Buttons
  theme_button_style: "solid",
  theme_button_radius: "0",
  theme_button_height: "52",
  theme_button_font_size: "12",
  theme_button_letter_spacing: "0.15",
  theme_button_font_weight: "300",
  // Status Bar
  theme_statusbar_bg_h: "30", theme_statusbar_bg_s: "5", theme_statusbar_bg_l: "8",
  theme_statusbar_fg_h: "30", theme_statusbar_fg_s: "10", theme_statusbar_fg_l: "98",
  theme_statusbar_visible: "true",
  theme_statusbar_height: "36",
  theme_statusbar_font_size: "10",
  // Header / Navigation
  theme_nav_bg_h: "30", theme_nav_bg_s: "10", theme_nav_bg_l: "98",
  theme_nav_fg_h: "30", theme_nav_fg_s: "5", theme_nav_fg_l: "20",
  theme_nav_height: "64",
  theme_nav_logo_height: "24",
  theme_nav_style: "centered",
  theme_nav_sticky: "true",
  // Product Card
  theme_card_aspect: "3/4",
  theme_card_hover_effect: "zoom",
  theme_card_show_category: "true",
  theme_card_show_badge: "true",
  theme_card_badge_style: "filled",
  theme_card_price_weight: "300",
  theme_card_name_size: "14",
  theme_card_gap: "16",
  // Product Page
  theme_pdp_layout: "side-by-side",
  theme_pdp_gallery_style: "scroll",
  theme_pdp_show_breadcrumb: "true",
  theme_pdp_show_editor_notes: "true",
  theme_pdp_show_details_grid: "true",
  theme_pdp_show_trust_badges: "true",
  theme_pdp_image_aspect: "3/4",
  // Footer
  theme_footer_bg_h: "30", theme_footer_bg_s: "5", theme_footer_bg_l: "8",
  theme_footer_fg_h: "30", theme_footer_fg_s: "10", theme_footer_fg_l: "98",
  theme_footer_layout: "two-column",
  theme_footer_show_social: "true",
  theme_footer_show_newsletter: "false",
  theme_footer_tagline: "Joias minimalistas feitas para o indivíduo moderno",
  // Checkout
  theme_checkout_style: "single-page",
  theme_checkout_show_trust: "true",
  // Global effects
  theme_animation_enabled: "true",
  theme_animation_intensity: "medium",
  theme_hover_scale: "1.05",
  theme_transition_speed: "700",
  theme_overlay_opacity: "0.05",
};

const THEME_KEYS = Object.keys(DEFAULTS);

// ─── Section Definitions ──────────────────────────────────
type SectionId = "colors" | "typography" | "layout" | "buttons" | "statusbar" | "header" | "product_card" | "product_page" | "footer" | "checkout" | "effects";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof Palette;
  group: string;
}

const SECTIONS: SectionDef[] = [
  { id: "colors", label: "Cores", icon: Palette, group: "Geral" },
  { id: "typography", label: "Tipografia", icon: Type, group: "Geral" },
  { id: "layout", label: "Layout & Espaçamento", icon: Layout, group: "Geral" },
  { id: "buttons", label: "Botões", icon: Square, group: "Geral" },
  { id: "effects", label: "Animações & Efeitos", icon: Layers, group: "Geral" },
  { id: "statusbar", label: "Barra de Status", icon: AlignCenter, group: "Seções" },
  { id: "header", label: "Cabeçalho / Navegação", icon: Menu, group: "Seções" },
  { id: "product_card", label: "Card de Produto", icon: ShoppingBag, group: "Seções" },
  { id: "product_page", label: "Página de Produto", icon: Eye, group: "Seções" },
  { id: "footer", label: "Rodapé", icon: ArrowUp, group: "Seções" },
  { id: "checkout", label: "Checkout", icon: CreditCard, group: "Seções" },
];

type Viewport = "desktop" | "tablet" | "mobile";

// ─── Main Component ───────────────────────────────────────
const AdminThemeEditor = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("colors");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (settings) {
      const merged = { ...DEFAULTS };
      THEME_KEYS.forEach(key => {
        if (settings[key]) merged[key] = settings[key];
      });
      setTheme(merged);
    }
  }, [settings]);

  const applyToIframe = useCallback((t: Record<string, string>) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const root = iframe.contentDocument.documentElement;

    // Core colors
    root.style.setProperty("--primary", `${t.theme_primary_h} ${t.theme_primary_s}% ${t.theme_primary_l}%`);
    root.style.setProperty("--primary-foreground", `${t.theme_bg_h} ${t.theme_bg_s}% ${t.theme_bg_l}%`);
    root.style.setProperty("--background", `${t.theme_bg_h} ${t.theme_bg_s}% ${t.theme_bg_l}%`);
    root.style.setProperty("--foreground", `${t.theme_fg_h} ${t.theme_fg_s}% ${t.theme_fg_l}%`);
    root.style.setProperty("--accent", `${t.theme_accent_h} ${t.theme_accent_s}% ${t.theme_accent_l}%`);
    root.style.setProperty("--muted", `${t.theme_muted_h} ${t.theme_muted_s}% ${t.theme_muted_l}%`);
    root.style.setProperty("--muted-foreground", `${t.theme_muted_h} ${t.theme_muted_s}% 45%`);
    root.style.setProperty("--border", `${t.theme_border_h} ${t.theme_border_s}% ${t.theme_border_l}%`);
    root.style.setProperty("--input", `${t.theme_border_h} ${t.theme_border_s}% ${t.theme_border_l}%`);
    root.style.setProperty("--destructive", `${t.theme_destructive_h} ${t.theme_destructive_s}% ${t.theme_destructive_l}%`);

    // Status bar
    root.style.setProperty("--status-bar", `${t.theme_statusbar_bg_h} ${t.theme_statusbar_bg_s}% ${t.theme_statusbar_bg_l}%`);
    root.style.setProperty("--status-bar-foreground", `${t.theme_statusbar_fg_h} ${t.theme_statusbar_fg_s}% ${t.theme_statusbar_fg_l}%`);

    // Nav
    root.style.setProperty("--nav-background", `${t.theme_nav_bg_h} ${t.theme_nav_bg_s}% ${t.theme_nav_bg_l}%`);
    root.style.setProperty("--nav-foreground", `${t.theme_nav_fg_h} ${t.theme_nav_fg_s}% ${t.theme_nav_fg_l}%`);

    // Footer (via custom properties)
    root.style.setProperty("--footer-bg", `${t.theme_footer_bg_h} ${t.theme_footer_bg_s}% ${t.theme_footer_bg_l}%`);
    root.style.setProperty("--footer-fg", `${t.theme_footer_fg_h} ${t.theme_footer_fg_s}% ${t.theme_footer_fg_l}%`);

    // Layout
    root.style.setProperty("--radius", `${t.theme_border_radius}rem`);
    root.style.setProperty("font-family", `'${t.theme_font_body}', sans-serif`);

    // Load Google Fonts
    const fonts = [t.theme_font_display, t.theme_font_body].filter(Boolean);
    const existing = iframe.contentDocument.getElementById("theme-fonts");
    if (existing) existing.remove();
    const link = iframe.contentDocument.createElement("link");
    link.id = "theme-fonts";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.replace(/ /g, "+")}:wght@200;300;400;500;600;700`).join("&")}&display=swap`;
    iframe.contentDocument.head.appendChild(link);
  }, []);

  const updateTheme = (key: string, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    applyToIframe(newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = THEME_KEYS.filter(key => theme[key] !== (settings?.[key] || DEFAULTS[key]));
      for (const key of changed) {
        await updateSetting.mutateAsync({ key, value: theme[key] });
      }
      toast.success("Tema salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar tema");
    }
    setSaving(false);
  };

  const handleReset = () => {
    setTheme(DEFAULTS);
    applyToIframe(DEFAULTS);
  };

  const handleIframeLoad = () => applyToIframe(theme);

  const viewportWidths: Record<Viewport, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  // Group sections
  const groups = SECTIONS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, SectionDef[]>);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-[hsl(var(--admin-bg))]">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <h1 className="text-[15px] font-semibold">Editor de Tema</h1>
          <span className="text-[11px] text-muted-foreground ml-2">
            {SECTIONS.find(s => s.id === activeSection)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-[hsl(var(--admin-bg))] rounded-lg p-0.5">
            {([
              { id: "desktop" as Viewport, icon: Monitor },
              { id: "tablet" as Viewport, icon: Tablet },
              { id: "mobile" as Viewport, icon: Smartphone },
            ]).map(v => (
              <button key={v.id} onClick={() => setViewport(v.id)}
                className={`p-1.5 rounded-md transition-colors ${viewport === v.id ? "bg-[hsl(var(--admin-surface))] shadow-sm" : "hover:bg-[hsl(var(--admin-surface))]"}`}>
                <v.icon className={`h-3.5 w-3.5 ${viewport === v.id ? "text-foreground" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-[12px] rounded-lg">
            <RotateCcw className="h-3 w-3 mr-1" /> Resetar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-[12px] rounded-lg">
            <Save className="h-3 w-3 mr-1" /> {saving ? "Salvando..." : "Salvar tema"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Settings panel */}
        <div className={`border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "w-0 border-r-0" : "w-80"}`}>
          {!sidebarCollapsed && (
            <>
              {/* Section nav */}
              <ScrollArea className="h-44 shrink-0 border-b border-[hsl(var(--admin-border))]">
                <div className="p-3 space-y-3">
                  {Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                      <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-1.5 px-1">{group}</p>
                      <div className="space-y-0.5">
                        {items.map(s => (
                          <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
                              activeSection === s.id
                                ? "bg-foreground/10 text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--admin-bg))]"
                            }`}>
                            <s.icon className="h-3.5 w-3.5 shrink-0" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Settings content */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                  {activeSection === "colors" && <ColorsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "typography" && <TypographySection theme={theme} onChange={updateTheme} />}
                  {activeSection === "layout" && <LayoutSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "buttons" && <ButtonsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "effects" && <EffectsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "statusbar" && <StatusBarSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "header" && <HeaderSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "product_card" && <ProductCardSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "product_page" && <ProductPageSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "footer" && <FooterSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "checkout" && <CheckoutSection theme={theme} onChange={updateTheme} />}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Live preview */}
        <div className="flex-1 bg-[hsl(var(--admin-bg))] flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white shadow-lg transition-all duration-300 h-full"
            style={{ width: viewportWidths[viewport], maxWidth: "100%", borderRadius: viewport !== "desktop" ? "12px" : "0", overflow: "hidden" }}>
            <iframe ref={iframeRef} src="/" className="w-full h-full border-0" title="Theme Preview" onLoad={handleIframeLoad} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Shared Components ────────────────────────────────────
interface FieldProps {
  theme: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{children}</h3>
);

const FieldGroup = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && <Label className="text-[12px] text-muted-foreground">{label}</Label>}
    {children}
  </div>
);

const ColorGroup = ({ label, hKey, sKey, lKey, theme, onChange }: {
  label: string; hKey: string; sKey: string; lKey: string;
  theme: Record<string, string>; onChange: (key: string, value: string) => void;
}) => {
  const h = parseInt(theme[hKey]) || 0;
  const s = parseInt(theme[sKey]) || 0;
  const l = parseInt(theme[lKey]) || 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[12px] text-muted-foreground">{label}</Label>
        <div className="w-6 h-6 rounded-md border border-[hsl(var(--admin-border))]" style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }} />
      </div>
      <div className="space-y-1">
        {[["H", hKey, 360], ["S", sKey, 100], ["L", lKey, 100]].map(([letter, key, max]) => (
          <div key={key as string} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-4">{letter as string}</span>
            <Slider value={[parseInt(theme[key as string]) || 0]} onValueChange={([v]) => onChange(key as string, String(v))} min={0} max={max as number} step={1} className="flex-1" />
            <Input value={theme[key as string] || "0"} onChange={(e) => onChange(key as string, e.target.value)} className="w-12 h-6 text-[11px] text-center p-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ToggleField = ({ label, themeKey, theme, onChange, description }: FieldProps & { label: string; themeKey: string; description?: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[12px]">{label}</p>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={theme[themeKey] === "true"} onCheckedChange={(v) => onChange(themeKey, String(v))} />
  </div>
);

const SliderField = ({ label, themeKey, theme, onChange, min, max, step = 1, unit = "" }: FieldProps & { label: string; themeKey: string; min: number; max: number; step?: number; unit?: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      <span className="text-[11px] text-muted-foreground">{theme[themeKey]}{unit}</span>
    </div>
    <Slider value={[parseFloat(theme[themeKey]) || 0]} onValueChange={([v]) => onChange(themeKey, String(v))} min={min} max={max} step={step} />
  </div>
);

const SelectField = ({ label, themeKey, theme, onChange, options }: FieldProps & { label: string; themeKey: string; options: { value: string; label: string }[] }) => (
  <div className="space-y-1.5">
    <Label className="text-[12px] text-muted-foreground">{label}</Label>
    <Select value={theme[themeKey]} onValueChange={(v) => onChange(themeKey, v)}>
      <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

const OptionCards = ({ themeKey, theme, onChange, options }: FieldProps & { themeKey: string; options: { value: string; label: string; desc?: string }[] }) => (
  <div className="space-y-1.5">
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(themeKey, o.value)}
        className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
          theme[themeKey] === o.value ? "border-foreground bg-foreground/5" : "border-[hsl(var(--admin-border))] hover:border-foreground/30"
        }`}>
        <p className="text-[12px] font-medium">{o.label}</p>
        {o.desc && <p className="text-[10px] text-muted-foreground">{o.desc}</p>}
      </button>
    ))}
  </div>
);

// ─── Section Panels ───────────────────────────────────────

const ColorsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Paleta de Cores</SectionTitle>
    <ColorGroup label="Cor Primária" hKey="theme_primary_h" sKey="theme_primary_s" lKey="theme_primary_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Fundo" hKey="theme_bg_h" sKey="theme_bg_s" lKey="theme_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_fg_h" sKey="theme_fg_s" lKey="theme_fg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Acento" hKey="theme_accent_h" sKey="theme_accent_s" lKey="theme_accent_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Neutro / Muted" hKey="theme_muted_h" sKey="theme_muted_s" lKey="theme_muted_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Bordas" hKey="theme_border_h" sKey="theme_border_s" lKey="theme_border_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Destrutivo / Erro" hKey="theme_destructive_h" sKey="theme_destructive_s" lKey="theme_destructive_l" theme={theme} onChange={onChange} />
  </>
);

const TypographySection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Tipografia</SectionTitle>
    <SelectField label="Fonte de Display (Títulos)" themeKey="theme_font_display" theme={theme} onChange={onChange}
      options={FONT_OPTIONS.map(f => ({ value: f.value, label: f.label }))} />
    <SelectField label="Fonte do Corpo (Texto)" themeKey="theme_font_body" theme={theme} onChange={onChange}
      options={FONT_OPTIONS.map(f => ({ value: f.value, label: f.label }))} />
    <SliderField label="Tamanho Base" themeKey="theme_font_size_base" theme={theme} onChange={onChange} min={12} max={20} unit="px" />
    <SelectField label="Peso dos Títulos" themeKey="theme_heading_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light (200)" },
        { value: "300", label: "Light (300)" },
        { value: "400", label: "Regular (400)" },
        { value: "500", label: "Medium (500)" },
        { value: "600", label: "Semi Bold (600)" },
        { value: "700", label: "Bold (700)" },
      ]} />
    <SelectField label="Peso do Corpo" themeKey="theme_body_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light (200)" },
        { value: "300", label: "Light (300)" },
        { value: "400", label: "Regular (400)" },
        { value: "500", label: "Medium (500)" },
      ]} />
    <SliderField label="Tracking Editorial" themeKey="theme_letter_spacing_editorial" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} unit="em" />
    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] space-y-2">
      <p className="text-[10px] text-muted-foreground">Preview</p>
      <p className="text-2xl" style={{ fontFamily: theme.theme_font_display, fontWeight: parseInt(theme.theme_heading_weight) }}>Título Display</p>
      <p className="text-[13px]" style={{ fontFamily: theme.theme_font_body, fontWeight: parseInt(theme.theme_body_weight) }}>
        Texto do corpo com a fonte e peso selecionados. Joias minimalistas feitas para o indivíduo moderno.
      </p>
      <p className="text-[10px] uppercase" style={{ fontFamily: theme.theme_font_body, letterSpacing: `${theme.theme_letter_spacing_editorial}em` }}>
        Texto Editorial
      </p>
    </div>
  </>
);

const LayoutSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Layout & Espaçamento</SectionTitle>
    <SliderField label="Border Radius Global" themeKey="theme_border_radius" theme={theme} onChange={onChange} min={0} max={1.5} step={0.125} unit="rem" />
    <div className="flex gap-2">
      {[0, 0.25, 0.375, 0.5, 0.75, 1].map(r => (
        <button key={r} onClick={() => onChange("theme_border_radius", String(r))}
          className={`w-10 h-10 border-2 transition-colors ${theme.theme_border_radius === String(r) ? "border-foreground" : "border-[hsl(var(--admin-border))]"}`}
          style={{ borderRadius: `${r}rem` }} />
      ))}
    </div>
    <SliderField label="Espaçamento entre Seções" themeKey="theme_spacing_section" theme={theme} onChange={onChange} min={48} max={160} step={8} unit="px" />
    <SliderField label="Largura Máxima do Conteúdo" themeKey="theme_max_width" theme={theme} onChange={onChange} min={1024} max={1920} step={40} unit="px" />
  </>
);

const ButtonsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Botões</SectionTitle>
    <OptionCards themeKey="theme_button_style" theme={theme} onChange={onChange} options={[
      { value: "solid", label: "Sólido", desc: "Fundo preenchido com contraste" },
      { value: "outline", label: "Outline", desc: "Apenas borda, sem preenchimento" },
      { value: "minimal", label: "Minimal", desc: "Sem borda nem fundo" },
    ]} />
    <SliderField label="Border Radius" themeKey="theme_button_radius" theme={theme} onChange={onChange} min={0} max={30} unit="px" />
    <SliderField label="Altura" themeKey="theme_button_height" theme={theme} onChange={onChange} min={36} max={64} unit="px" />
    <SliderField label="Tamanho da Fonte" themeKey="theme_button_font_size" theme={theme} onChange={onChange} min={10} max={16} unit="px" />
    <SliderField label="Letter Spacing" themeKey="theme_button_letter_spacing" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} unit="em" />
    <SelectField label="Peso da Fonte" themeKey="theme_button_font_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light" }, { value: "300", label: "Light" },
        { value: "400", label: "Regular" }, { value: "500", label: "Medium" },
        { value: "600", label: "Semi Bold" },
      ]} />
    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))] flex flex-col gap-2 items-center">
      <p className="text-[10px] text-muted-foreground self-start">Preview</p>
      <button className="px-8 transition-all" style={{
        height: `${theme.theme_button_height}px`,
        borderRadius: `${theme.theme_button_radius}px`,
        fontSize: `${theme.theme_button_font_size}px`,
        fontWeight: parseInt(theme.theme_button_font_weight),
        letterSpacing: `${theme.theme_button_letter_spacing}em`,
        textTransform: "uppercase" as const,
        ...(theme.theme_button_style === "solid" ? { backgroundColor: "hsl(var(--foreground))", color: "hsl(var(--background))" } :
          theme.theme_button_style === "outline" ? { border: "1px solid hsl(var(--foreground))", background: "transparent" } :
          { background: "transparent", textDecoration: "underline" }),
      }}>
        Adicionar à Sacola
      </button>
    </div>
  </>
);

const EffectsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Animações & Efeitos</SectionTitle>
    <ToggleField label="Animações habilitadas" themeKey="theme_animation_enabled" theme={theme} onChange={onChange} description="Ativa/desativa todas as animações de scroll e transição" />
    <SelectField label="Intensidade" themeKey="theme_animation_intensity" theme={theme} onChange={onChange}
      options={[
        { value: "subtle", label: "Sutil" },
        { value: "medium", label: "Médio" },
        { value: "dramatic", label: "Dramático" },
      ]} />
    <SliderField label="Escala no Hover (imagens)" themeKey="theme_hover_scale" theme={theme} onChange={onChange} min={1} max={1.15} step={0.01} />
    <SliderField label="Velocidade da Transição" themeKey="theme_transition_speed" theme={theme} onChange={onChange} min={200} max={1200} step={50} unit="ms" />
    <SliderField label="Opacidade do Overlay" themeKey="theme_overlay_opacity" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} />
  </>
);

const StatusBarSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Barra de Status</SectionTitle>
    <ToggleField label="Visível" themeKey="theme_statusbar_visible" theme={theme} onChange={onChange} />
    <ColorGroup label="Fundo" hKey="theme_statusbar_bg_h" sKey="theme_statusbar_bg_s" lKey="theme_statusbar_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_statusbar_fg_h" sKey="theme_statusbar_fg_s" lKey="theme_statusbar_fg_l" theme={theme} onChange={onChange} />
    <SliderField label="Altura" themeKey="theme_statusbar_height" theme={theme} onChange={onChange} min={28} max={48} unit="px" />
    <SliderField label="Tamanho da Fonte" themeKey="theme_statusbar_font_size" theme={theme} onChange={onChange} min={8} max={14} unit="px" />
  </>
);

const HeaderSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Cabeçalho / Navegação</SectionTitle>
    <ColorGroup label="Fundo da Navegação" hKey="theme_nav_bg_h" sKey="theme_nav_bg_s" lKey="theme_nav_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto da Navegação" hKey="theme_nav_fg_h" sKey="theme_nav_fg_s" lKey="theme_nav_fg_l" theme={theme} onChange={onChange} />
    <SliderField label="Altura do Header" themeKey="theme_nav_height" theme={theme} onChange={onChange} min={48} max={96} unit="px" />
    <SliderField label="Altura do Logo" themeKey="theme_nav_logo_height" theme={theme} onChange={onChange} min={16} max={48} unit="px" />
    <SelectField label="Estilo do Logo" themeKey="theme_nav_style" theme={theme} onChange={onChange}
      options={[
        { value: "centered", label: "Logo Centralizado" },
        { value: "left", label: "Logo à Esquerda" },
      ]} />
    <ToggleField label="Header Fixo (Sticky)" themeKey="theme_nav_sticky" theme={theme} onChange={onChange} />
  </>
);

const ProductCardSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Card de Produto</SectionTitle>
    <SelectField label="Proporção da Imagem" themeKey="theme_card_aspect" theme={theme} onChange={onChange}
      options={[
        { value: "1/1", label: "Quadrado (1:1)" },
        { value: "3/4", label: "Retrato (3:4)" },
        { value: "4/5", label: "Retrato Alto (4:5)" },
        { value: "2/3", label: "Retrato Estreito (2:3)" },
      ]} />
    <SelectField label="Efeito de Hover" themeKey="theme_card_hover_effect" theme={theme} onChange={onChange}
      options={[
        { value: "zoom", label: "Zoom" },
        { value: "fade-swap", label: "Troca de Imagem" },
        { value: "none", label: "Nenhum" },
      ]} />
    <ToggleField label="Mostrar Categoria" themeKey="theme_card_show_category" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Badge 'Novo'" themeKey="theme_card_show_badge" theme={theme} onChange={onChange} />
    <SelectField label="Estilo do Badge" themeKey="theme_card_badge_style" theme={theme} onChange={onChange}
      options={[
        { value: "filled", label: "Preenchido" },
        { value: "outline", label: "Outline" },
        { value: "minimal", label: "Texto Simples" },
      ]} />
    <SliderField label="Tamanho do Nome" themeKey="theme_card_name_size" theme={theme} onChange={onChange} min={12} max={18} unit="px" />
    <SelectField label="Peso do Preço" themeKey="theme_card_price_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light" }, { value: "300", label: "Light" },
        { value: "400", label: "Regular" }, { value: "500", label: "Medium" },
      ]} />
    <SliderField label="Gap entre Cards" themeKey="theme_card_gap" theme={theme} onChange={onChange} min={8} max={32} step={4} unit="px" />
  </>
);

const ProductPageSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Página de Produto</SectionTitle>
    <SelectField label="Layout" themeKey="theme_pdp_layout" theme={theme} onChange={onChange}
      options={[
        { value: "side-by-side", label: "Lado a Lado" },
        { value: "gallery-left", label: "Galeria à Esquerda" },
        { value: "full-width-hero", label: "Hero Full Width" },
      ]} />
    <SelectField label="Estilo da Galeria" themeKey="theme_pdp_gallery_style" theme={theme} onChange={onChange}
      options={[
        { value: "scroll", label: "Scroll Vertical" },
        { value: "grid", label: "Grid" },
        { value: "carousel", label: "Carrossel" },
      ]} />
    <SelectField label="Proporção das Imagens" themeKey="theme_pdp_image_aspect" theme={theme} onChange={onChange}
      options={[
        { value: "1/1", label: "Quadrado" },
        { value: "3/4", label: "3:4" },
        { value: "4/5", label: "4:5" },
        { value: "auto", label: "Automático" },
      ]} />
    <ToggleField label="Breadcrumb" themeKey="theme_pdp_show_breadcrumb" theme={theme} onChange={onChange} />
    <ToggleField label="Notas do Editor" themeKey="theme_pdp_show_editor_notes" theme={theme} onChange={onChange} />
    <ToggleField label="Grid de Detalhes" themeKey="theme_pdp_show_details_grid" theme={theme} onChange={onChange} description="Material, dimensões, peso, fecho" />
    <ToggleField label="Badges de Confiança" themeKey="theme_pdp_show_trust_badges" theme={theme} onChange={onChange} description="Garantia, frete grátis, troca fácil" />
  </>
);

const FooterSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Rodapé</SectionTitle>
    <ColorGroup label="Fundo" hKey="theme_footer_bg_h" sKey="theme_footer_bg_s" lKey="theme_footer_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_footer_fg_h" sKey="theme_footer_fg_s" lKey="theme_footer_fg_l" theme={theme} onChange={onChange} />
    <SelectField label="Layout" themeKey="theme_footer_layout" theme={theme} onChange={onChange}
      options={[
        { value: "two-column", label: "Duas Colunas" },
        { value: "centered", label: "Centralizado" },
        { value: "minimal", label: "Minimal" },
      ]} />
    <ToggleField label="Mostrar Redes Sociais" themeKey="theme_footer_show_social" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Newsletter" themeKey="theme_footer_show_newsletter" theme={theme} onChange={onChange} />
    <FieldGroup label="Tagline">
      <Input value={theme.theme_footer_tagline} onChange={(e) => onChange("theme_footer_tagline", e.target.value)}
        className="h-8 text-[12px]" placeholder="Joias minimalistas..." />
    </FieldGroup>
  </>
);

const CheckoutSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Checkout</SectionTitle>
    <SelectField label="Estilo do Checkout" themeKey="theme_checkout_style" theme={theme} onChange={onChange}
      options={[
        { value: "single-page", label: "Página Única" },
        { value: "multi-step", label: "Multi Etapas" },
      ]} />
    <ToggleField label="Mostrar Selos de Confiança" themeKey="theme_checkout_show_trust" theme={theme} onChange={onChange} />
  </>
);

export default AdminThemeEditor;
