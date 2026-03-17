import { useState } from "react";
import { useHomepageSections, useUpdateSection, useCreateSection, useDeleteSection } from "@/hooks/useHomepageSections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Grande" },
  { value: "fifty_fifty", label: "50/50" },
  { value: "one_third_two_thirds", label: "1/3 + 2/3" },
  { value: "product_carousel", label: "Carrossel de Produtos" },
  { value: "editorial", label: "Editorial" },
];

type SectionForm = {
  section_type: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  link_url: string;
  image_url: string;
  image_url_2: string;
  sort_order: string;
  is_visible: boolean;
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

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SectionForm>(empty);

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

  const handleSave = async () => {
    const payload = {
      section_type: form.section_type,
      title: form.title || null,
      subtitle: form.subtitle || null,
      description: form.description || null,
      cta_text: form.cta_text || null,
      link_url: form.link_url || null,
      image_url: form.image_url || null,
      image_url_2: form.image_url_2 || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_visible: form.is_visible,
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

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light">Homepage</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Seção</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ordem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Visível</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections?.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.sort_order}</TableCell>
              <TableCell>{SECTION_TYPES.find(t => t.value === s.section_type)?.label || s.section_type}</TableCell>
              <TableCell>{s.title || "—"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => toggleVisibility(s)}>
                  {s.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {sections?.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma seção. Crie seções para montar a homepage.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Editar Seção" : "Nova Seção"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Tipo</Label>
              <Select value={form.section_type} onValueChange={(v) => setForm(f => ({ ...f, section_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input value={form.subtitle} onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Texto do CTA</Label>
              <Input value={form.cta_text} onChange={(e) => setForm(f => ({ ...f, cta_text: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input value={form.link_url} onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem 1</Label>
              <Input value={form.image_url} onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem 2</Label>
              <Input value={form.image_url_2} onChange={(e) => setForm(f => ({ ...f, image_url_2: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_visible} onCheckedChange={(v) => setForm(f => ({ ...f, is_visible: v }))} />
              <Label>Visível</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createSection.isPending || updateSection.isPending}>
              {editId ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepage;
