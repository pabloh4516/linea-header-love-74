import { useState, useRef, useCallback, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, Monitor, Smartphone, Tablet, RotateCcw, Palette, Type, Layout, Square } from "lucide-react";

const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans" },
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lora", label: "Lora" },
  { value: "Raleway", label: "Raleway" },
  { value: "Libre Baskerville", label: "Libre Baskerville" },
];

const THEME_KEYS = [
  "theme_primary_h", "theme_primary_s", "theme_primary_l",
  "theme_bg_h", "theme_bg_s", "theme_bg_l",
  "theme_fg_h", "theme_fg_s", "theme_fg_l",
  "theme_accent_h", "theme_accent_s", "theme_accent_l",
  "theme_font_display", "theme_font_body",
  "theme_border_radius", "theme_button_style",
];

const DEFAULTS: Record<string, string> = {
  theme_primary_h: "30", theme_primary_s: "5", theme_primary_l: "8",
  theme_bg_h: "30", theme_bg_s: "10", theme_bg_l: "98",
  theme_fg_h: "30", theme_fg_s: "5", theme_fg_l: "8",
  theme_accent_h: "35", theme_accent_s: "30", theme_accent_l: "90",
  theme_font_display: "DM Sans", theme_font_body: "DM Sans",
  theme_border_radius: "0.375", theme_button_style: "solid",
};

type Viewport = "desktop" | "tablet" | "mobile";

const AdminThemeEditor = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("colors");

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
    root.style.setProperty("--primary", `${t.theme_primary_h} ${t.theme_primary_s}% ${t.theme_primary_l}%`);
    root.style.setProperty("--primary-foreground", `${t.theme_bg_h} ${t.theme_bg_s}% ${t.theme_bg_l}%`);
    root.style.setProperty("--background", `${t.theme_bg_h} ${t.theme_bg_s}% ${t.theme_bg_l}%`);
    root.style.setProperty("--foreground", `${t.theme_fg_h} ${t.theme_fg_s}% ${t.theme_fg_l}%`);
    root.style.setProperty("--accent", `${t.theme_accent_h} ${t.theme_accent_s}% ${t.theme_accent_l}%`);
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
      for (const key of THEME_KEYS) {
        if (theme[key] !== (settings?.[key] || DEFAULTS[key])) {
          await updateSetting.mutateAsync({ key, value: theme[key] });
        }
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

  const handleIframeLoad = () => {
    applyToIframe(theme);
  };

  const viewportWidths: Record<Viewport, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  const sections = [
    { id: "colors", label: "Cores", icon: Palette },
    { id: "typography", label: "Tipografia", icon: Type },
    { id: "layout", label: "Layout", icon: Layout },
    { id: "buttons", label: "Botões", icon: Square },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] shrink-0">
        <h1 className="text-[15px] font-semibold">Editor de Tema</h1>
        <div className="flex items-center gap-2">
          {/* Viewport switcher */}
          <div className="flex items-center gap-0.5 bg-[hsl(var(--admin-bg))] rounded-lg p-0.5">
            {([
              { id: "desktop" as Viewport, icon: Monitor },
              { id: "tablet" as Viewport, icon: Tablet },
              { id: "mobile" as Viewport, icon: Smartphone },
            ]).map(v => (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                className={`p-1.5 rounded-md transition-colors ${viewport === v.id ? "bg-[hsl(var(--admin-surface))] shadow-sm" : "hover:bg-[hsl(var(--admin-surface))]"}`}
              >
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
        <div className="w-72 border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] flex flex-col shrink-0 overflow-hidden">
          {/* Section tabs */}
          <div className="flex border-b border-[hsl(var(--admin-border))] shrink-0">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors border-b-2 ${
                  activeSection === s.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Settings content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeSection === "colors" && (
              <>
                <ColorGroup label="Cor Primária" hKey="theme_primary_h" sKey="theme_primary_s" lKey="theme_primary_l" theme={theme} onChange={updateTheme} />
                <ColorGroup label="Fundo" hKey="theme_bg_h" sKey="theme_bg_s" lKey="theme_bg_l" theme={theme} onChange={updateTheme} />
                <ColorGroup label="Texto" hKey="theme_fg_h" sKey="theme_fg_s" lKey="theme_fg_l" theme={theme} onChange={updateTheme} />
                <ColorGroup label="Acento" hKey="theme_accent_h" sKey="theme_accent_s" lKey="theme_accent_l" theme={theme} onChange={updateTheme} />
              </>
            )}

            {activeSection === "typography" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Fonte de Display</Label>
                  <Select value={theme.theme_font_display} onValueChange={(v) => updateTheme("theme_font_display", v)}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Fonte do Corpo</Label>
                  <Select value={theme.theme_font_body} onValueChange={(v) => updateTheme("theme_font_body", v)}>
                    <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--admin-bg))]">
                  <p className="text-[11px] text-muted-foreground mb-2">Preview</p>
                  <p className="text-lg font-light" style={{ fontFamily: theme.theme_font_display }}>Heading Display</p>
                  <p className="text-[13px]" style={{ fontFamily: theme.theme_font_body }}>Body text example paragraph showing the selected font.</p>
                </div>
              </>
            )}

            {activeSection === "layout" && (
              <>
                <div className="space-y-2">
                  <Label className="text-[12px] text-muted-foreground">Border Radius</Label>
                  <Slider
                    value={[parseFloat(theme.theme_border_radius) * 100]}
                    onValueChange={([v]) => updateTheme("theme_border_radius", String(v / 100))}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <p className="text-[11px] text-muted-foreground">{theme.theme_border_radius}rem</p>
                </div>
                <div className="flex gap-2">
                  {[0, 0.25, 0.375, 0.5, 0.75, 1].map(r => (
                    <button
                      key={r}
                      onClick={() => updateTheme("theme_border_radius", String(r))}
                      className={`w-10 h-10 border-2 transition-colors ${
                        theme.theme_border_radius === String(r)
                          ? "border-foreground"
                          : "border-[hsl(var(--admin-border))]"
                      }`}
                      style={{ borderRadius: `${r}rem` }}
                    />
                  ))}
                </div>
              </>
            )}

            {activeSection === "buttons" && (
              <>
                <div className="space-y-2">
                  <Label className="text-[12px] text-muted-foreground">Estilo dos Botões</Label>
                  <div className="space-y-2">
                    {[
                      { value: "solid", label: "Sólido" },
                      { value: "outline", label: "Outline" },
                      { value: "minimal", label: "Minimal" },
                    ].map(style => (
                      <button
                        key={style.value}
                        onClick={() => updateTheme("theme_button_style", style.value)}
                        className={`w-full p-3 rounded-lg border text-left text-[13px] transition-colors ${
                          theme.theme_button_style === style.value
                            ? "border-foreground bg-foreground/5"
                            : "border-[hsl(var(--admin-border))] hover:border-foreground/30"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="flex-1 bg-[hsl(var(--admin-bg))] flex items-start justify-center p-4 overflow-auto">
          <div
            className="bg-white shadow-lg transition-all duration-300 h-full"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
              borderRadius: viewport !== "desktop" ? "12px" : "0",
              overflow: "hidden",
            }}
          >
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Theme Preview"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorGroup = ({
  label, hKey, sKey, lKey, theme, onChange,
}: {
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
        <div
          className="w-6 h-6 rounded-md border border-[hsl(var(--admin-border))]"
          style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-5">H</span>
          <Slider value={[h]} onValueChange={([v]) => onChange(hKey, String(v))} min={0} max={360} step={1} className="flex-1" />
          <Input value={h} onChange={(e) => onChange(hKey, e.target.value)} className="w-14 h-6 text-[11px] text-center p-0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-5">S</span>
          <Slider value={[s]} onValueChange={([v]) => onChange(sKey, String(v))} min={0} max={100} step={1} className="flex-1" />
          <Input value={s} onChange={(e) => onChange(sKey, e.target.value)} className="w-14 h-6 text-[11px] text-center p-0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-5">L</span>
          <Slider value={[l]} onValueChange={([v]) => onChange(lKey, String(v))} min={0} max={100} step={1} className="flex-1" />
          <Input value={l} onChange={(e) => onChange(lKey, e.target.value)} className="w-14 h-6 text-[11px] text-center p-0" />
        </div>
      </div>
    </div>
  );
};

export default AdminThemeEditor;
