import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAllThemes, useActivateTheme, Theme } from "@/hooks/useThemes";
import { themeRegistry } from "@/theme-engine";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Palette, Download, Upload, Plus, Trash2, Check, Save, MoreHorizontal,
  Eye, Copy, Pencil, FileUp, FilePlus, Layers,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ─── DEFAULTS ──────────────────────────────────────────────
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
  theme_card_columns_desktop: "3", theme_card_aspect: "3/4",
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
  bg: hslToHex(parseInt(settings.theme_bg_h || DEFAULTS.theme_bg_h), parseInt(settings.theme_bg_s || DEFAULTS.theme_bg_s), parseInt(settings.theme_bg_l || DEFAULTS.theme_bg_l)),
  fg: hslToHex(parseInt(settings.theme_fg_h || DEFAULTS.theme_fg_h), parseInt(settings.theme_fg_s || DEFAULTS.theme_fg_s), parseInt(settings.theme_fg_l || DEFAULTS.theme_fg_l)),
  primary: hslToHex(parseInt(settings.theme_primary_h || DEFAULTS.theme_primary_h), parseInt(settings.theme_primary_s || DEFAULTS.theme_primary_s), parseInt(settings.theme_primary_l || DEFAULTS.theme_primary_l)),
  accent: hslToHex(parseInt(settings.theme_accent_h || DEFAULTS.theme_accent_h), parseInt(settings.theme_accent_s || DEFAULTS.theme_accent_s), parseInt(settings.theme_accent_l || DEFAULTS.theme_accent_l)),
});

// ─── Mini Preview ──────────────────────────────────────────
const ThemeMiniPreview = ({ settings, large }: { settings: Record<string, string>; large?: boolean }) => {
  const colors = getPreviewColors(settings);
  const fontDisplay = settings.theme_font_display || DEFAULTS.theme_font_display;
  const buttonStyle = settings.theme_button_style || DEFAULTS.theme_button_style;
  const borderRadius = parseFloat(settings.theme_button_radius || DEFAULTS.theme_button_radius);
  const navStyle = settings.theme_nav_style || DEFAULTS.theme_nav_style;
  const headingWeight = settings.theme_heading_weight || DEFAULTS.theme_heading_weight;

  return (
    <div className={`w-full ${large ? "aspect-[16/10]" : "aspect-[4/3]"} rounded-lg overflow-hidden border border-[hsl(var(--admin-border))] relative`} style={{ backgroundColor: colors.bg }}>
      {/* Status bar */}
      <div className="h-[8%] w-full flex items-center justify-center" style={{ backgroundColor: colors.fg }}>
        <div className="w-[40%] h-[3px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.6 }} />
      </div>
      {/* Nav */}
      <div className="h-[10%] w-full flex items-center px-[8%]" style={{ borderBottom: `1px solid ${colors.fg}15`, justifyContent: navStyle === "centered" ? "center" : "flex-start", gap: "8%" }}>
        {navStyle === "left-aligned" && (
          <div className="text-[7px] font-bold tracking-[0.15em] shrink-0" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>LINEA</div>
        )}
        <div className="flex gap-[4%]">
          <div className="w-[12%] h-[3px] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.4 }} />
          <div className="w-[12%] h-[3px] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.4 }} />
        </div>
        {navStyle === "centered" && (
          <div className="text-[7px] font-bold tracking-[0.15em]" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>LINEA</div>
        )}
      </div>
      {/* Hero */}
      <div className="h-[45%] w-full flex flex-col items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
        <div className="text-[9px] tracking-[0.1em] mb-1" style={{ color: colors.fg, fontFamily: fontDisplay, fontWeight: Number(headingWeight) }}>Coleção</div>
        <div className="px-3 py-1 text-[6px] uppercase tracking-[0.15em]" style={{
          borderRadius: `${borderRadius}px`,
          ...(buttonStyle === "solid" ? { backgroundColor: colors.fg, color: colors.bg }
            : buttonStyle === "outline" ? { border: `1px solid ${colors.fg}`, color: colors.fg }
            : { color: colors.fg, textDecoration: "underline" }),
        }}>Ver Agora</div>
      </div>
      {/* Product grid */}
      <div className="flex gap-[3%] px-[6%] pt-[4%]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 space-y-[4px]">
            <div className="rounded-sm" style={{ aspectRatio: "3/4", backgroundColor: `${colors.fg}${Math.round((0.85 + i * 0.03) * 15).toString(16).padStart(2, "0")}` }} />
            <div className="h-[2px] w-[70%] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.3 }} />
            <div className="h-[2px] w-[40%] rounded-full" style={{ backgroundColor: colors.fg, opacity: 0.2 }} />
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-[6%] flex items-center justify-center" style={{ backgroundColor: colors.fg }}>
        <div className="w-[30%] h-[2px] rounded-full" style={{ backgroundColor: colors.bg, opacity: 0.4 }} />
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────
const AdminThemes = () => {
  const navigate = useNavigate();
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
  const [activateConfirm, setActivateConfirm] = useState<Theme | null>(null);

  const allThemes = themes || [];
  const activeTheme = allThemes.find(t => t.is_active);
  const inactiveThemes = allThemes.filter(t => !t.is_active);

  // ─── Activate/Install theme ─────────────────────────────
  const handleActivate = async (theme: Theme) => {
    setInstalling(theme.id);
    try {
      const themeDefaults = Object.fromEntries(
        Object.entries(themeRegistry.getDefaultSettings(theme.slug) || {}).map(([key, value]) => [`theme_${key}`, String(value)])
      ) as Record<string, string>;
      const settings = {
        ...themeDefaults,
        ...((theme.settings_data || {}) as Record<string, string>),
      };
      for (const [key, value] of Object.entries(settings)) {
        await updateSetting.mutateAsync({ key, value });
      }
      await activateTheme.mutateAsync(theme.id);
      toast.success(`Tema "${theme.name}" ativado com sucesso!`);
      // Force reload to re-sync theme registry
      window.location.reload();
      return;
    } catch {
      toast.error("Erro ao ativar tema");
    }
    setInstalling(null);
    setActivateConfirm(null);
  };

  // ─── Save current ───────────────────────────────────────
  const handleSaveCurrent = async () => {
    if (!saveName.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      const settings: Record<string, string> = {};
      if (currentSettings) {
        Object.entries(currentSettings).forEach(([key, value]) => {
          if (key.startsWith("theme_")) settings[key] = value;
        });
      }
      const slug = saveName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase.from("themes" as any).insert({ name: saveName.trim(), slug, description: saveDesc.trim() || null, settings_data: settings } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Tema salvo!");
      setSaveDialogOpen(false); setSaveName(""); setSaveDesc("");
    } catch { toast.error("Erro ao salvar tema"); }
  };

  // ─── Duplicate ──────────────────────────────────────────
  const handleDuplicate = async (theme: Theme) => {
    try {
      const slug = `${theme.slug}-copia-${Date.now()}`;
      const { error } = await supabase.from("themes" as any).insert({
        name: `${theme.name} (Cópia)`, slug, description: theme.description,
        settings_data: theme.settings_data, author: theme.author, version: theme.version,
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success(`Tema duplicado como "${theme.name} (Cópia)"`);
    } catch { toast.error("Erro ao duplicar tema"); }
  };

  // ─── Export ─────────────────────────────────────────────
  const handleExport = (theme?: Theme) => {
    const settings: Record<string, string> = {};
    if (theme) { Object.assign(settings, theme.settings_data); }
    else if (currentSettings) { Object.entries(currentSettings).forEach(([k, v]) => { if (k.startsWith("theme_")) settings[k] = v; }); }
    const blob = new Blob([JSON.stringify({ name: theme?.name || "Meu Tema", description: theme?.description || "", version: theme?.version || "1.0", exported_at: new Date().toISOString(), settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `tema-${(theme?.slug || "custom")}.json`; a.click();
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
        if (!data.settings || typeof data.settings !== "object") { toast.error("Arquivo de tema inválido"); return; }
        const slug = (data.name || "importado").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
        const { error } = await supabase.from("themes" as any).insert({ name: data.name || "Tema Importado", slug, description: data.description || `Importado em ${new Date().toLocaleDateString("pt-BR")}`, settings_data: data.settings } as any);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["themes"] });
        toast.success(`Tema "${data.name || "Importado"}" adicionado!`);
      } catch { toast.error("Erro ao importar tema"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── Delete ─────────────────────────────────────────────
  const handleDelete = async (theme: Theme) => {
    if (theme.is_active) { toast.error("Não é possível excluir o tema ativo"); return; }
    try {
      const { error } = await supabase.from("themes" as any).delete().eq("id", theme.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Tema excluído");
    } catch { toast.error("Erro ao excluir tema"); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page header + Add theme button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Temas</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Gerencie a aparência da sua loja.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 text-[13px] rounded-lg">
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar tema
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5 mr-2" /> Upload de tema (JSON)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
              <Save className="h-3.5 w-3.5 mr-2" /> Salvar tema atual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              const slug = `tema-branco-${Date.now()}`;
              await supabase.from("themes" as any).insert({ name: "Tema em Branco", slug, description: "Tema com configurações padrão", settings_data: DEFAULTS } as any);
              queryClient.invalidateQueries({ queryKey: ["themes"] });
              toast.success("Tema em branco criado!");
            }}>
              <FilePlus className="h-3.5 w-3.5 mr-2" /> Criar tema em branco
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {/* ─── Active Theme Card ─────────────────────────────── */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-6">
            <div className="w-64 shrink-0">
              <ThemeMiniPreview settings={activeTheme ? (activeTheme.settings_data as Record<string, string>) : (currentSettings || DEFAULTS)} large />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--admin-success)/0.1)] text-[hsl(var(--admin-success))] font-medium uppercase tracking-wider">
                  Tema ativo
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mt-1">
                {activeTheme?.name || "Tema Atual"}
              </h2>
              {activeTheme?.author && (
                <p className="text-[12px] text-muted-foreground">por {activeTheme.author} · v{activeTheme.version}</p>
              )}
              {activeTheme?.description && (
                <p className="text-[13px] text-muted-foreground mt-2">{activeTheme.description}</p>
              )}

              {/* Color dots */}
              <div className="flex items-center gap-2 mt-4">
                {(() => {
                  const s = activeTheme ? (activeTheme.settings_data as Record<string, string>) : (currentSettings || DEFAULTS);
                  const c = getPreviewColors(s);
                  return [c.bg, c.fg, c.primary, c.accent].map((hex, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-[hsl(var(--admin-border))]" style={{ backgroundColor: hex }} />
                  ));
                })()}
                <span className="text-[11px] text-muted-foreground ml-1">
                  {(activeTheme?.settings_data as Record<string, string>)?.theme_font_display || currentSettings?.theme_font_display || DEFAULTS.theme_font_display}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-5">
                <Button size="sm" className="h-9 text-[13px] rounded-lg px-5" onClick={() => navigate("/admin/theme")}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Personalizar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {activeTheme && (
                      <DropdownMenuItem onClick={() => handleDuplicate(activeTheme)}>
                        <Copy className="h-3.5 w-3.5 mr-2" /> Duplicar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleExport(activeTheme)}>
                      <Download className="h-3.5 w-3.5 mr-2" /> Exportar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Gallery: Inactive Themes ──────────────────────── */}
      <div>
        <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Galeria de Temas
          {inactiveThemes.length === 0 && (
            <span className="text-[12px] font-normal text-muted-foreground">(nenhum tema adicional)</span>
          )}
        </h2>

        {inactiveThemes.length === 0 ? (
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-10 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground mb-4">
              Adicione temas para experimentar diferentes visuais na sua loja.
            </p>
            <Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1" /> Importar JSON
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveThemes.map((theme) => {
              const s = (theme.settings_data || {}) as Record<string, string>;
              const isInstalling = installing === theme.id;
              return (
                <div key={theme.id} className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] overflow-hidden hover:border-foreground/20 transition-colors group">
                  <ThemeMiniPreview settings={s} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold truncate">{theme.name}</h3>
                        {theme.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{theme.description}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleDuplicate(theme)}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(theme)}>
                            <Download className="h-3.5 w-3.5 mr-2" /> Exportar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(theme)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Color dots & font */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {(() => {
                        const c = getPreviewColors(s);
                        return [c.bg, c.fg, c.primary].map((hex, i) => (
                          <div key={i} className="h-3.5 w-3.5 rounded-full border border-[hsl(var(--admin-border))]" style={{ backgroundColor: hex }} />
                        ));
                      })()}
                      <span className="text-[10px] text-muted-foreground ml-1">{s.theme_font_display || DEFAULTS.theme_font_display}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[12px] rounded-lg"
                        onClick={() => navigate(`/admin/theme?preview=${theme.id}`)}>
                        <Eye className="h-3 w-3 mr-1" /> Visualizar
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-[12px] rounded-lg"
                        onClick={() => setActivateConfirm(theme)} disabled={isInstalling}>
                        {isInstalling ? (
                          <><div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent mr-1" /> Ativando...</>
                        ) : (
                          <><Check className="h-3 w-3 mr-1" /> Ativar</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Activate Confirmation Dialog ──────────────────── */}
      <AlertDialog open={!!activateConfirm} onOpenChange={(open) => !open && setActivateConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ativar tema "{activateConfirm?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              O tema atual será desativado e substituído por este. Suas configurações atuais serão mantidas como tema salvo se você desejar voltar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => activateConfirm && handleActivate(activateConfirm)}>
              Ativar tema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Save Dialog ───────────────────────────────────── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Tema Atual</DialogTitle>
            <DialogDescription>Salve as configurações atuais como um novo tema reutilizável.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Nome do Tema</Label>
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Ex: Meu Tema Elegante" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Descrição (opcional)</Label>
              <Textarea value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} placeholder="Breve descrição do tema..." className="text-[13px] min-h-[60px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSaveCurrent}><Save className="h-3.5 w-3.5 mr-1" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminThemes;
