import { useState } from "react";
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, MoreHorizontal, Image as ImageIcon, Link2, ExternalLink } from "lucide-react";
import VariantManager from "@/components/admin/VariantManager";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProductForm = {
  name: string;
  category_id: string;
  price: string;
  image_url: string;
  hover_image_url: string;
  is_new: boolean;
  is_visible: boolean;
  description: string;
  material: string;
  dimensions: string;
  weight: string;
  editors_notes: string;
  sku: string;
  sort_order: string;
};

const empty: ProductForm = {
  name: "", category_id: "", price: "", image_url: "", hover_image_url: "",
  is_new: false, is_visible: true, description: "", material: "", dimensions: "",
  weight: "", editors_notes: "", sku: "", sort_order: "0",
};

const AdminProducts = () => {
  const { data: products, isLoading } = useAllProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { upload } = useImageUpload();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(empty);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name, category_id: p.category_id || "", price: String(p.price),
      image_url: p.image_url || "", hover_image_url: p.hover_image_url || "",
      is_new: p.is_new, is_visible: p.is_visible, description: p.description || "",
      material: p.material || "", dimensions: p.dimensions || "", weight: p.weight || "",
      editors_notes: p.editors_notes || "", sku: p.sku || "", sort_order: String(p.sort_order),
    });
    setEditId(p.id);
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "hover_image_url") => {
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
      name: form.name,
      category_id: form.category_id || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      hover_image_url: form.hover_image_url || null,
      is_new: form.is_new,
      is_visible: form.is_visible,
      description: form.description || null,
      material: form.material || null,
      dimensions: form.dimensions || null,
      weight: form.weight || null,
      editors_notes: form.editors_notes || null,
      sku: form.sku || null,
      sort_order: parseInt(form.sort_order) || 0,
    };
    try {
      if (editId) {
        await updateProduct.mutateAsync({ id: editId, ...payload });
        toast.success("Produto atualizado!");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Produto criado!");
      }
      setOpen(false);
    } catch {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este produto?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto deletado!");
    } catch {
      toast.error("Erro ao deletar");
    }
  };

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

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
        <h1 className="text-xl font-semibold text-foreground">Produtos</h1>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar produto
        </Button>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="p-3 border-b border-[hsl(var(--admin-border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-[13px] border-0 bg-[hsl(var(--admin-bg))] rounded-lg focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-16"></th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Produto</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Status</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden sm:table-cell">Categoria</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5">Preço</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {filtered?.map((p) => (
                <tr key={p.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group" onClick={() => openEdit(p)}>
                  <td className="px-4 py-2.5">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-dashed border-[hsl(var(--admin-border))] flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                    {p.sku && <p className="text-[11px] text-muted-foreground">{p.sku}</p>}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        p.is_visible
                          ? "bg-[hsl(var(--admin-success)/0.1)] text-[hsl(var(--admin-success))]"
                          : "bg-[hsl(var(--admin-bg))] text-muted-foreground"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.is_visible ? "bg-[hsl(var(--admin-success))]" : "bg-muted-foreground"}`} />
                        {p.is_visible ? "Ativo" : "Rascunho"}
                      </span>
                      {p.is_new && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--admin-info)/0.1)] text-[hsl(var(--admin-info))]">
                          Novo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="text-[13px] text-muted-foreground">
                      {(p as any).categories?.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[13px] font-medium">R${Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12 text-[13px]">
                    {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic info card */}
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Título</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="text-[13px] min-h-[80px]" />
              </div>
            </div>

            {/* Media */}
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <h3 className="text-[13px] font-semibold">Mídia</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Imagem principal</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url")} disabled={uploading} className="h-9 text-[12px]" />
                  {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Imagem hover</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "hover_image_url")} disabled={uploading} className="h-9 text-[12px]" />
                  {form.hover_image_url && <img src={form.hover_image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--admin-border))]" />}
                </div>
              </div>
            </div>

            {/* Pricing + Category */}
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <h3 className="text-[13px] font-semibold">Preço e Organização</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Preço (R$)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">SKU</Label>
                  <Input value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Ordem</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} className="h-9 text-[13px]" />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
              <h3 className="text-[13px] font-semibold">Detalhes do Produto</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Material</Label>
                  <Input value={form.material} onChange={(e) => setForm(f => ({ ...f, material: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Dimensões</Label>
                  <Input value={form.dimensions} onChange={(e) => setForm(f => ({ ...f, dimensions: e.target.value }))} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-muted-foreground">Peso</Label>
                  <Input value={form.weight} onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))} className="h-9 text-[13px]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Notas do Editor</Label>
                <Textarea value={form.editors_notes} onChange={(e) => setForm(f => ({ ...f, editors_notes: e.target.value }))} className="text-[13px] min-h-[60px]" />
              </div>
            </div>

            {/* Variants - only show when editing */}
            {editId && <VariantManager productId={editId} />}

            {/* Status */}
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">Status</h3>
              <div className="flex items-center justify-between">
                <Label className="text-[13px]">Produto visível na loja</Label>
                <Switch checked={form.is_visible} onCheckedChange={(v) => setForm(f => ({ ...f, is_visible: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[13px]">Marcar como novo</Label>
                <Switch checked={form.is_new} onCheckedChange={(v) => setForm(f => ({ ...f, is_new: v }))} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending} className="h-8 text-[13px] rounded-lg">
              {editId ? "Salvar" : "Adicionar produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
