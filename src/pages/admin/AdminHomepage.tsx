import { useState } from "react";
import { useHomepageSections, useUpdateSection, useCreateSection, useDeleteSection } from "@/hooks/useHomepageSections";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, MoreHorizontal, GripVertical, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Grande" },
  { value: "fifty_fifty", label: "50/50" },
  { value: "one_third_two_thirds", label: "1/3 + 2/3" },
  { value: "product_carousel", label: "Carrossel de Produtos" },
  { value: "editorial", label: "Editorial" },
];

type SectionForm = {
  section_type: string; title: string; subtitle: string; description: string;
  cta_text: string; link_url: string; image_url: string; image_url_2: string;
  sort_order: string; is_visible: boolean;
};

const empty: SectionForm = {
  section_type: "hero", title: "", subtitle: "", description: "",
  cta_text: "", link_url: "", image_url: "", image_url_2: "",
  sort_order: "0", is_visible: true,
};

const AdminHomepage = () => {
  const { data: sections, isLoading } = useHomepageSections();
  const updateSection = useUpdateSection();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const { upload } = useImageUpload();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SectionForm>(empty);
  const [uploading, setUploading] = useState(false);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (s: any) => {
    setForm({
      section_type: s.section_type, title: s.title || "", subtitle: s.subtitle || "",
      description: s.description || "", cta_text: s.cta_text || "", link_url: s.link_url || "",
      image_url: s.image_url || "", image_url_2: s.image_url_2 || "",
      sort_order: String(s.sort_order), is_visible: s.is_visible,
    });
    setEditId(s.id);
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "image_url_2") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await upload(file);
      setForm((f) => ({ ...f, [field]: url }));
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const payload = {
      section_type: form.section_type,
      title: form.title || null, subtitle: form.subtitle || null,
      description: form.description || null, cta_text: form.cta_text || null,
      link_url: form.link_url || null, image_url: form.image_url || null,
      image_url_2: form.image_url_2 || null,
      sort_order: parseInt(form.sort_order) || 0, is_visible: form.is_visible,
    };
    try {
      if (editId) {
        await updateSection.mutateAsync({ id: editId, ...payload });
        toast.success("Seção atualizada!");
      } else {
        await createSection.mutateAsync(payload);
        toast.success("Seção criada!");
      }
      setOpen(false);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const toggleVisibility = async (s: any) => {
    await updateSection.mutateAsync({ id: s.id, is_visible: !s.is_visible });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta seção?")) return;
    try {
      await deleteSection.mutateAsync(id);
      toast.success("Seção deletada!");
    } catch {
      toast.error("Erro ao deletar");
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Homepage</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Organize as seções da página inicial da sua loja.</p>
        </div>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar seção
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="divide-y divide-[hsl(var(--admin-border))]">
          {sections?.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group"
              onClick={() => openEdit(s)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {s.title || SECTION_TYPES.find(t => t.value === s.section_type)?.label || s.section_type}
                  </p>
                  <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-[hsl(var(--admin-bg))] flex-shrink-0">
                    {SECTION_TYPES.find(t => t.value === s.section_type)?.label || s.section_type}
                  </span>
                </div>
                {s.subtitle && <p className="text-[11px] text-muted-foreground truncate">{s.subtitle}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleVisibility(s)}
                >
                  {s.is_visible ? <Eye className="h-3.5 w-3.5 text-[hsl(var(--admin-success))]" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {sections?.length === 0 && (
            <div className="text-center py-12">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">Nenhuma seção. Adicione seções para montar a homepage.</p>
            </div>
          )}
        </div>
        {sections && sections.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
            {sections.length} {sections.length === 1 ? "seção" : "seções"}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Seção" : "Adicionar Seção"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Tipo de seção</Label>
                <Select value={form.section_type} onValueChange={(v) => setForm(f => ({ ...f, section_type: v }))}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Título</Label>
                  <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Subtítulo</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))} className="h-9 text-[13px]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="text-[13px] min-h-[60px]" />
              </div>
            </div>

            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <h3 className="text-[13px] font-semibold">Mídia e Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Texto do CTA</Label>
                  <Input value={form.cta_text} onChange={(e) => setForm(f => ({ ...f, cta_text: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Link URL</Label>
                  <Input value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} className="h-9 text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Imagem 1</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url")} disabled={uploading} className="h-9 text-[12px]" />
                  {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Imagem 2</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url_2")} disabled={uploading} className="h-9 text-[12px]" />
                  {form.image_url_2 && <img src={form.image_url_2} alt="" className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />}
                </div>
              </div>
            </div>

            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">Configuração</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Ordem</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} className="h-9 text-[13px] w-24" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Label className="text-[13px]">Seção visível na homepage</Label>
                <Switch checked={form.is_visible} onCheckedChange={(v) => setForm(f => ({ ...f, is_visible: v }))} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={createSection.isPending || updateSection.isPending} className="h-8 text-[13px] rounded-lg">
              {editId ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepage;
