import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type CatForm = { name: string; slug: string; description: string; sort_order: string };
const empty: CatForm = { name: "", slug: "", description: "", sort_order: "0" };

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(empty);

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || "", sort_order: String(c.sort_order) });
    setEditId(c.id);
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { name: form.name, slug: form.slug, description: form.description || null, sort_order: parseInt(form.sort_order) || 0 };
    try {
      if (editId) {
        await updateCat.mutateAsync({ id: editId, ...payload });
        toast.success("Categoria atualizada!");
      } else {
        await createCat.mutateAsync(payload);
        toast.success("Categoria criada!");
      }
      setOpen(false);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta categoria?")) return;
    try {
      await deleteCat.mutateAsync(id);
      toast.success("Categoria deletada!");
    } catch {
      toast.error("Erro ao deletar");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light">Categorias</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Categoria</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell>{c.sort_order}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {categories?.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma categoria</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ex: earrings" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createCat.isPending || updateCat.isPending}>
              {editId ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
