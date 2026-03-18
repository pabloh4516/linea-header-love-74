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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const SortableItem = ({ section, onEdit, onToggle, onDelete }: {
  section: any; onEdit: (s: any) => void; onToggle: (s: any) => void; onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group border-b border-[hsl(var(--admin-border))] last:border-b-0"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      </button>
      <div className="h-9 w-9 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center flex-shrink-0">
        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0" onClick={() => onEdit(section)}>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-foreground truncate">
            {section.title || SECTION_TYPES.find(t => t.value === section.section_type)?.label || section.section_type}
          </p>
          <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-[hsl(var(--admin-bg))] flex-shrink-0">
            {SECTION_TYPES.find(t => t.value === section.section_type)?.label || section.section_type}
          </span>
        </div>
        {section.subtitle && <p className="text-[11px] text-muted-foreground truncate">{section.subtitle}</p>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggle(section)}>
          {section.is_visible ? <Eye className="h-3.5 w-3.5 text-[hsl(var(--admin-success))]" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(section)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(section.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
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
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !sections) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    // Update sort_order for all affected sections
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await updateSection.mutateAsync({ id: reordered[i].id, sort_order: i });
      }
    }
    toast.success("Ordem atualizada!");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" /></div>;
  }

  const sortedSections = sections ? [...sections].sort((a, b) => a.sort_order - b.sort_order) : [];

  return (
    <div className={`${showPreview ? "flex gap-4 h-[calc(100vh-7rem)] -m-4 md:-m-6 lg:-m-8" : "space-y-5"}`}>
      <div className={showPreview ? "w-96 flex flex-col shrink-0 p-4 overflow-y-auto" : ""}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Homepage</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Arraste para reordenar as seções.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-8 text-[13px] rounded-lg">
              <Eye className="h-3.5 w-3.5 mr-1" /> {showPreview ? "Fechar" : "Preview"}
            </Button>
            <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
              <Plus className="h-3.5 w-3.5 mr-1" /> Seção
            </Button>
          </div>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
          {sortedSections.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sortedSections.map((s) => (
                  <SortableItem key={s.id} section={s} onEdit={openEdit} onToggle={toggleVisibility} onDelete={handleDelete} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">Adicione seções para montar a homepage.</p>
            </div>
          )}
          {sortedSections.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
              {sortedSections.length} {sortedSections.length === 1 ? "seção" : "seções"}
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      {showPreview && (
        <div className="flex-1 bg-[hsl(var(--admin-bg))] rounded-xl overflow-hidden border border-[hsl(var(--admin-border))]">
          <iframe src="/" className="w-full h-full border-0" title="Homepage Preview" />
        </div>
      )}

      {/* Section form dialog */}
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
                  <SelectContent>{SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-[12px] text-muted-foreground">Título</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="h-9 text-[13px]" /></div>
                <div className="space-y-1.5"><Label className="text-[12px] text-muted-foreground">Subtítulo</Label><Input value={form.subtitle} onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))} className="h-9 text-[13px]" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-[12px] text-muted-foreground">Descrição</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="text-[13px] min-h-[60px]" /></div>
            </div>
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <h3 className="text-[13px] font-semibold">Mídia e Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-[12px] text-muted-foreground">Texto do CTA</Label><Input value={form.cta_text} onChange={(e) => setForm(f => ({ ...f, cta_text: e.target.value }))} className="h-9 text-[13px]" /></div>
                <div className="space-y-1.5"><Label className="text-[12px] text-muted-foreground">Link URL</Label><Input value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} className="h-9 text-[13px]" /></div>
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
              <div className="flex items-center justify-between"><Label className="text-[13px]">Visível na homepage</Label><Switch checked={form.is_visible} onCheckedChange={(v) => setForm(f => ({ ...f, is_visible: v }))} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={createSection.isPending || updateSection.isPending} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Adicionar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepage;
