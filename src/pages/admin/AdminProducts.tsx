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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light">Produtos</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Produto</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Visível</TableHead>
            <TableHead>Novo</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />}
              </TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{(p as any).categories?.name || "—"}</TableCell>
              <TableCell>€{Number(p.price).toFixed(2)}</TableCell>
              <TableCell>{p.is_visible ? "✓" : "—"}</TableCell>
              <TableCell>{p.is_new ? "NEW" : "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products?.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum produto cadastrado</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preço (€)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Imagem Principal</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image_url")} disabled={uploading} />
              {form.image_url && <img src={form.image_url} alt="" className="w-20 h-20 object-cover rounded" />}
            </div>
            <div className="space-y-2">
              <Label>Imagem Hover</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "hover_image_url")} disabled={uploading} />
              {form.hover_image_url && <img src={form.hover_image_url} alt="" className="w-20 h-20 object-cover rounded" />}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={form.material} onChange={(e) => setForm(f => ({ ...f, material: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Dimensões</Label>
              <Input value={form.dimensions} onChange={(e) => setForm(f => ({ ...f, dimensions: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Peso</Label>
              <Input value={form.weight} onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notas do Editor</Label>
              <Textarea value={form.editors_notes} onChange={(e) => setForm(f => ({ ...f, editors_notes: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_new} onCheckedChange={(v) => setForm(f => ({ ...f, is_new: v }))} />
                <Label>Novo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_visible} onCheckedChange={(v) => setForm(f => ({ ...f, is_visible: v }))} />
                <Label>Visível</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending}>
              {editId ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
