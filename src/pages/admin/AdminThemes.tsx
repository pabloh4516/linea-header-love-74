import { useState, useRef } from "react";
import { useAllThemes, useActivateTheme, Theme } from "@/hooks/useThemes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Palette, Download, Upload, Plus, Trash2, Check, Sparkles, Save,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── DEFAULTS (must match AdminThemeEditor) ────────────────
const DEFAULTS: Record<string, string> = {
  theme_primary_h: "30", theme_primary_s: "5", theme_primary_l: "8",
  theme_bg_h: "30", theme_bg_s: "10", theme_bg_l: "98",
  theme_fg_h: "30", theme_fg_s: "5", theme_fg_l: "8",
  theme_accent_h: "35", theme_accent_s: "30", theme_accent_l: "90",
  theme_muted_h: "30", theme_muted_s: "8", theme_muted_l: "95",
  theme_border_h: "30", theme_border_s: "8", theme_border_l: "88",
  theme_font_display: "DM Sans", theme_font_body: "DM Sans",
  theme_heading_weight: "300", theme_body_weight: "300",
  theme_border_radius: "0.375", theme_button_style: "solid",
  theme_button_radius: "0", theme_spacing_section: "96",
  theme_nav_style: "centered", theme_footer_layout: "two-column",
  theme_cart_style: "drawer", theme_animation_intensity: "medium",
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const getPreviewColors = (settings: Record<string, string>) => ({
  bg: hslToHex(
    parseInt(settings.theme_bg_h || DEFAULTS.theme_bg_h),
    parseInt(settings.theme_bg_s || DEFAULTS.theme_bg_s),
    parseInt(settings.theme_bg_l || DEFAULTS.theme_bg_l),
  ),
  fg: hslToHex(
    parseInt(settings.theme_fg_h || DEFAULTS.theme_fg_h),
    parseInt(settings.theme_fg_s || DEFAULTS.theme_fg_s),
    parseInt(settings.theme_fg_l || DEFAULTS.theme_fg_l),
  ),
  primary: hslToHex(
    parseInt(settings.theme_primary_h || DEFAULTS.theme_primary_h),
    parseInt(settings.theme_primary_s || DEFAULTS.theme_primary_s),
    parseInt(settings.theme_primary_l || DEFAULTS.theme_primary_l),
  ),
  accent: hslToHex(
    parseInt(settings.theme_accent_h || DEFAULTS.theme_accent_h),
    parseInt(settings.theme_accent_s || DEFAULTS.theme_accent_s),
    parseInt(settings.theme_accent_l || DEFAULTS.theme_accent_l),
  ),
});

// ─── Mini Preview Component ────────────────────────────────
const ThemeMiniPreview = ({ settings }: { settings: Record<string, string> }) => {
  const colors = getPreviewColors(settings);
  const fontDisplay = settings.theme_font_display || DEFAULTS.theme_font_display;
  const buttonStyle = settings.theme_button_style || DEFAULTS.theme_button_style;
  const borderRadius = parseFloat(settings.theme_button_radius || DEFAULTS.theme_button_radius);
  const navStyle = settings.theme_nav_style || DEFAULTS.theme_nav_style;
  const columns = parseInt(settings.theme_card_columns_desktop || DEFAULTS.theme_card_columns_desktop);
  const footerLayout = settings.theme_footer_layout || DEFAULTS.theme_footer_layout;
  const headingWeight = settings.theme_heading_weight || DEFAULTS.theme_heading_weight;

  return (
    <div
      className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-[hsl(var(--admin-border))] relative"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Status bar */}
      <div className="h-[8%] w-full flex items-center justify-center" style={{ backgroundColor: colors.fg }}>
        <div className="w-[40%] h-[3px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.6 }} />
      </div>
      {/* Nav */}
      <div className="h-[10%] w-full flex items-center px-[8%]" style={{ borderBottom: `1px solid ${colors.fg}15`, justifyContent: navStyle === "centered" ? "center" : "flex-start", gap: "8%" }}>
        {navStyle === "left-aligned" && (
          <div className="text-[7px] font-bold tracking-[0.15em] shrink-0" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>
            LINEA
          </div>
        )}
        <div className="flex gap-[4%]">
          <div className="w-[12%] h-[3px] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.4 }} />
          <div className="w-[12%] h-[3px] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.4 }} />
        </div>
        {navStyle === "centered" && (
          <div className="text-[7px] font-bold tracking-[0.15em]" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>
            LINEA
          </div>
        )}
        {navStyle === "centered" && <div className="w-[8%]" />}
      </div>
      {/* Hero */}
      <div className="h-[45%] w-full flex flex-col items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
        <div className="text-[9px] tracking-[0.1em] mb-1" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>
          Coleção
        </div>
        <div
          className="px-3 py-1 text-[6px] uppercase tracking-[0.15em]"
          style={{
            borderRadius: `${borderRadius}px`,
            ...(buttonStyle === "solid"
              ? { backgroundColor: colors.fg, color: colors.bg }
              : buttonStyle === "outline"
              ? { border: `1px solid ${colors.fg}`, color: colors.fg }
              : { color: colors.fg, textDecoration: "underline" }),
          }}
        >
          Ver Agora
        </div>
      </div>
      {/* Product grid - reflects column count */}
      <div className="flex gap-[3%] px-[6%] pt-[4%]">
        {Array.from({ length: Math.min(columns, 4) }).map((_, i) => (
          <div key={i} className="flex-1 space-y-[4px]">
            <div className="rounded-sm" style={{ aspectRatio: settings.theme_card_aspect === "square" ? "1/1" : "3/4", backgroundColor: `${colors.fg}${Math.round((0.85 + i * 0.03) * 15).toString(16).padStart(2, "0")}` }} />
            <div className="h-[2px] w-[70%] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.3 }} />
            <div className="h-[2px] w-[40%] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.2 }} />
          </div>
        ))}
      </div>
      {/* Footer hint */}
      <div className="absolute bottom-0 left-0 right-0 h-[6%] flex items-center justify-center" style={{ backgroundColor: colors.fg }}>
        {footerLayout === "minimal" ? (
          <div className="w-[30%] h-[2px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.4 }} />
        ) : (
          <div className="flex gap-[8%]">
            <div className="w-[15%] h-[2px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.4 }} />
            <div className="w-[15%] h-[2px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.4 }} />
            {footerLayout === "three-column" && <div className="w-[15%] h-[2px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.4 }} />}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────
const AdminThemes = () => {
  const { data: themes, isLoading } = useAllThemes();
  const activateTheme = useActivateTheme();
  const queryClient = useQueryClient();
  const { data: currentSettings } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [installing, setInstalling] = useState<string | null>(null);

  const allThemes = themes || [];

  // ─── Install theme ──────────────────────────────────────
  const handleInstall = async (theme: Theme) => {
    setInstalling(theme.id);
    try {
      const settings = (theme.settings_data || {}) as Record<string, string>;
      for (const [key, value] of Object.entries(settings)) {
        await updateSetting.mutateAsync({ key, value });
      }
      await activateTheme.mutateAsync(theme.id);
      toast.success(`Tema "${theme.name}" instalado com sucesso!`);
    } catch {
      toast.error("Erro ao instalar tema");
    }
    setInstalling(null);
  };

  // ─── Save current as custom ─────────────────────────────
  const handleSaveCurrent = async () => {
    if (!saveName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      const settings: Record<string, string> = {};
      if (currentSettings) {
        Object.entries(currentSettings).forEach(([key, value]) => {
          if (key.startsWith("theme_")) settings[key] = value;
        });
      }
      const slug = saveName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase
        .from("themes" as any)
        .insert({
          name: saveName.trim(),
          slug,
          description: saveDesc.trim() || null,
          settings_data: settings,
        } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Tema salvo!");
      setSaveDialogOpen(false);
      setSaveName("");
      setSaveDesc("");
    } catch {
      toast.error("Erro ao salvar tema");
    }
  };

  // ─── Export ─────────────────────────────────────────────
  const handleExport = (theme?: Theme) => {
    const settings: Record<string, string> = {};
    if (theme) {
      Object.assign(settings, theme.settings_data);
    } else if (currentSettings) {
      Object.entries(currentSettings).forEach(([key, value]) => {
        if (key.startsWith("theme_")) settings[key] = value;
      });
    }
    const exportData = {
      name: theme?.name || "Meu Tema",
      description: theme?.description || "",
      version: theme?.version || "1.0",
      exported_at: new Date().toISOString(),
      settings,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tema-${(theme?.slug || theme?.name || "custom").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tema exportado!");
  };

  // ─── Import ─────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.settings || typeof data.settings !== "object") {
          toast.error("Arquivo de tema inválido");
          return;
        }
        const slug = (data.name || "importado").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
        const { error } = await supabase
          .from("themes" as any)
          .insert({
            name: data.name || "Tema Importado",
            slug,
            description: data.description || `Importado em ${new Date().toLocaleDateString("pt-BR")}`,
            settings_data: data.settings,
          } as any);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["themes"] });
        toast.success(`Tema "${data.name || "Importado"}" adicionado à galeria!`);
      } catch {
        toast.error("Erro ao importar tema. Verifique o formato do arquivo.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── Delete ─────────────────────────────────────────────
  const handleDelete = async (theme: Theme) => {
    if (theme.is_active) {
      toast.error("Não é possível excluir o tema ativo");
      return;
    }
    try {
      const { error } = await supabase
        .from("themes" as any)
        .delete()
        .eq("id", theme.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Tema excluído");
    } catch {
      toast.error("Erro ao excluir tema");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Galeria de Temas</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Escolha, salve, exporte e importe temas para sua loja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[13px] rounded-lg" onClick={() => handleExport()}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar Atual
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[13px] rounded-lg" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Importar
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button size="sm" className="h-8 text-[13px] rounded-lg" onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-3.5 w-3.5 mr-1" /> Salvar Tema Atual
          </Button>
        </div>
      </div>

      {/* Current theme banner */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
        <div className="flex items-start gap-5">
          <div className="w-48 shrink-0">
            <ThemeMiniPreview settings={currentSettings || DEFAULTS} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-[hsl(var(--admin-success))]" />
              <h3 className="text-[14px] font-semibold">Tema Atual</h3>
            </div>
            <p className="text-[12px] text-muted-foreground mb-3">
              Este é o tema atualmente ativo na sua loja. Você pode personalizá-lo no{" "}
              <a href="/admin/theme" className="text-foreground underline">Editor de Tema</a>.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>Fonte: {currentSettings?.theme_font_display || DEFAULTS.theme_font_display} / {currentSettings?.theme_font_body || DEFAULTS.theme_font_body}</span>
              <span>Botão: {currentSettings?.theme_button_style || DEFAULTS.theme_button_style}</span>
              <span>Nav: {currentSettings?.theme_nav_style || DEFAULTS.theme_nav_style}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All themes */}
      <div>
        <h2 className="text-[15px] font-semibold mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" /> Todos os Temas
          {allThemes.length === 0 && (
            <span className="text-[12px] font-normal text-muted-foreground">(nenhum salvo ainda)</span>
          )}
        </h2>
        {allThemes.length === 0 ? (
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-8 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground mb-3">
              Salve configurações do seu tema atual ou importe um arquivo JSON para começar.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => setSaveDialogOpen(true)}>
                <Save className="h-3 w-3 mr-1" /> Salvar Atual
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1" /> Importar JSON
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onInstall={handleInstall}
                onExport={handleExport}
                onDelete={handleDelete}
                installing={installing === theme.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Tema Atual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[13px] text-muted-foreground">
              Salve as configurações atuais do tema como um novo tema reutilizável.
            </p>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Nome do Tema</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Ex: Meu Tema Elegante"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Descrição (opcional)</Label>
              <Textarea
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                placeholder="Breve descrição do tema..."
                className="text-[13px] min-h-[60px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveCurrent}>
                <Save className="h-3.5 w-3.5 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Theme Card ────────────────────────────────────────────
const ThemeCard = ({
  theme,
  onInstall,
  onExport,
  onDelete,
  installing,
}: {
  theme: Theme;
  onInstall: (t: Theme) => void;
  onExport: (t: Theme) => void;
  onDelete: (t: Theme) => void;
  installing: boolean;
}) => {
  const settings = (theme.settings_data || {}) as Record<string, string>;

  return (
    <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] overflow-hidden hover:border-foreground/20 transition-colors group">
      <ThemeMiniPreview settings={settings} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-[14px] font-semibold flex items-center gap-1.5">
              {theme.name}
              {theme.is_active && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--admin-info)/0.1)] text-[hsl(var(--admin-info))] font-medium">
                  ATIVO
                </span>
              )}
            </h3>
            {theme.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{theme.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="8" cy="3" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="8" cy="13" r="1.5" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onExport(theme)}>
                <Download className="h-3.5 w-3.5 mr-2" /> Exportar JSON
              </DropdownMenuItem>
              {!theme.is_preset && (
                <DropdownMenuItem onClick={() => onDelete(theme)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span>{settings.theme_font_display || DEFAULTS.theme_font_display}</span>
          <span>·</span>
          <span>{settings.theme_button_style || DEFAULTS.theme_button_style}</span>
        </div>
        <Button
          size="sm"
          className="w-full h-8 mt-3 text-[12px] rounded-lg"
          onClick={() => onInstall(theme)}
          disabled={installing}
        >
          {installing ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent mr-1" />
              Instalando...
            </>
          ) : (
            <>
              <Palette className="h-3 w-3 mr-1" /> Instalar Tema
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminThemes;
