import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

type CouponForm = {
  code: string;
  discount_type: string;
  discount_value: string;
  min_purchase: string;
  max_uses: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const empty: CouponForm = {
  code: "", discount_type: "percentage", discount_value: "", min_purchase: "",
  max_uses: "", starts_at: "", expires_at: "", is_active: true,
};

const AdminCoupons = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(empty);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value) || 0,
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      };
      if (editId) {
        const { error } = await supabase.from("coupons" as any).update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coupons"] }); setOpen(false); toast.success(editId ? "Cupom atualizado!" : "Cupom criado!"); },
    onError: () => toast.error("Erro ao salvar cupom"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["coupons"] }); toast.success("Cupom excluído!"); },
  });

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => {
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value),
      min_purchase: c.min_purchase ? String(c.min_purchase) : "", max_uses: c.max_uses ? String(c.max_uses) : "",
      starts_at: c.starts_at ? c.starts_at.split("T")[0] : "", expires_at: c.expires_at ? c.expires_at.split("T")[0] : "",
      is_active: c.is_active,
    });
    setEditId(c.id);
    setOpen(true);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cupons de Desconto</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} cupons cadastrados</p>
        </div>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Novo cupom
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Código</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Desconto</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Usos</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Validade</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Status</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono font-bold">{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Código copiado!"); }} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[13px]">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `R$${Number(c.discount_value).toFixed(2)}`}
                    {c.min_purchase > 0 && <span className="text-muted-foreground text-[11px] ml-1">(mín. R${Number(c.min_purchase).toFixed(2)})</span>}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] hidden md:table-cell">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-muted-foreground hidden md:table-cell">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "Sem expiração"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.is_active ? "bg-[hsl(var(--admin-success)/0.1)] text-[hsl(var(--admin-success))]" : "bg-muted text-muted-foreground"}`}>
                      {c.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Excluir cupom?")) del.mutate(c.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12 text-[13px]">Nenhum cupom cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader><DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Cupom" : "Novo Cupom"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Código</Label>
              <Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="EX: DESCONTO10" className="h-9 text-[13px] font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Tipo</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Valor</Label>
                <Input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm(f => ({ ...f, discount_value: e.target.value }))} className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Compra mínima (R$)</Label>
                <Input type="number" step="0.01" value={form.min_purchase} onChange={(e) => setForm(f => ({ ...f, min_purchase: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Limite de usos</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Ilimitado" className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Início</Label>
                <Input type="date" value={form.starts_at} onChange={(e) => setForm(f => ({ ...f, starts_at: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Expiração</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[13px]">Cupom ativo</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.code} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Criar cupom"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
