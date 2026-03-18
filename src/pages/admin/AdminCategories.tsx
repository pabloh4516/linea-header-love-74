import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, LayoutGrid, LayoutList, Grid3X3, Star, MoreHorizontal, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GRID_LAYOUTS = [
  { value: "standard", label: "Padrão", icon: LayoutGrid, description: "Grid uniforme 4 colunas" },
  { value: "editorial", label: "Editorial", icon: LayoutList, description: "Linhas alternadas" },
  { value: "masonry", label: "Masonry", icon: Grid3X3, description: "Alturas variadas" },
  { value: "highlight", label: "Destaque", icon: Star, description: "Primeiro produto hero" },
];

type CatForm = { name: string; slug: string; description: string; sort_order: string; grid_layout: string };
const empty: CatForm = { name: "", slug: "", description: "", sort_order: "0", grid_layout: "standard" };

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
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      sort_order: String(c.sort_order), grid_layout: c.grid_layout || "standard",
    });
    setEditId(c.id);
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name, slug: form.slug, description: form.description || null,
      sort_order: parseInt(form.sort_order) || 0, grid_layout: form.grid_layout,
    };
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
        <h1 className="text-xl font-semibold text-foreground">Categorias</h1>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar categoria
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Categoria</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden sm:table-cell">Slug</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Layout</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {categories?.map((c: any) => {
                const layout = GRID_LAYOUTS.find(l => l.value === c.grid_layout);
                return (
                  <tr key={c.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group" onClick={() => openEdit(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                          {c.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{c.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[13px] text-muted-foreground font-mono">{c.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-[hsl(var(--admin-bg))]">
                        {layout && <layout.icon className="h-3 w-3" />}
                        {layout?.label || "Padrão"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {categories?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground py-12 text-[13px]">Nenhuma categoria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {categories && categories.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
            {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ex: earrings" className="h-9 text-[13px] font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="text-[13px] min-h-[60px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Ordem de exibição</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} className="h-9 text-[13px] w-24" />
              </div>
            </div>

            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">Layout do Grid</h3>
              <div className="grid grid-cols-2 gap-2">
                {GRID_LAYOUTS.map((layout) => {
                  const Icon = layout.icon;
                  const isSelected = form.grid_layout === layout.value;
                  return (
                    <button
                      key={layout.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, grid_layout: layout.value }))}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
                          : "border-[hsl(var(--admin-border))] hover:border-foreground/30"
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-foreground" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-[12px] font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{layout.label}</p>
                        <p className="text-[10px] text-muted-foreground">{layout.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={createCat.isPending || updateCat.isPending} className="h-8 text-[13px] rounded-lg">
              {editId ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
