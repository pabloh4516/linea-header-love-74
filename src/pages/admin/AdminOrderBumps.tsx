import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

type BumpForm = {
  product_id: string;
  bump_product_id: string;
  discount_percentage: string;
  title: string;
  description: string;
  is_active: boolean;
};

const empty: BumpForm = {
  product_id: "", bump_product_id: "", discount_percentage: "0",
  title: "", description: "", is_active: true,
};

const AdminOrderBumps = () => {
  const qc = useQueryClient();
  const { data: products = [] } = useAllProducts();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BumpForm>(empty);

  const { data: bumps = [], isLoading } = useQuery({
    queryKey: ["order-bumps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_bumps" as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        product_id: form.product_id,
        bump_product_id: form.bump_product_id,
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        title: form.title || null,
        description: form.description || null,
        is_active: form.is_active,
      };
      if (editId) {
        const { error } = await supabase.from("order_bumps" as any).update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("order_bumps" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["order-bumps"] }); setOpen(false); toast.success("Salvo!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_bumps" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["order-bumps"] }); toast.success("Excluído!"); },
  });

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (b: any) => {
    setForm({
      product_id: b.product_id, bump_product_id: b.bump_product_id,
      discount_percentage: String(b.discount_percentage), title: b.title || "",
      description: b.description || "", is_active: b.is_active,
    });
    setEditId(b.id);
    setOpen(true);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || "—";

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Order Bumps</h1>
          <p className="text-sm text-muted-foreground">Ofertas especiais exibidas no checkout</p>
        </div>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Novo order bump
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Produto principal</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Bump (oferta)</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Desconto</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {bumps.map((b: any) => (
                <tr key={b.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] font-medium">{getProductName(b.product_id)}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <p className="text-[13px]">{getProductName(b.bump_product_id)}</p>
                    </div>
                    {b.title && <p className="text-[11px] text-muted-foreground">{b.title}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] hidden md:table-cell">
                    {b.discount_percentage > 0 ? `${b.discount_percentage}% off` : "Sem desconto"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${b.is_active ? "bg-[hsl(var(--admin-success)/0.1)] text-[hsl(var(--admin-success))]" : "bg-muted text-muted-foreground"}`}>
                      {b.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Excluir?")) del.mutate(b.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {bumps.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-12 text-[13px]">Nenhum order bump configurado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader><DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Order Bump" : "Novo Order Bump"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Quando o cliente comprar</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Selecione o produto principal" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Oferecer também (bump)</Label>
              <Select value={form.bump_product_id} onValueChange={(v) => setForm(f => ({ ...f, bump_product_id: v }))}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Selecione o produto bump" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Desconto no bump (%)</Label>
              <Input type="number" value={form.discount_percentage} onChange={(e) => setForm(f => ({ ...f, discount_percentage: e.target.value }))} className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Título da oferta</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Aproveite e leve também!" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="text-[13px] min-h-[60px]" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[13px]">Ativo</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.product_id || !form.bump_product_id} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Criar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderBumps;
