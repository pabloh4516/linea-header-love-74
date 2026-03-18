import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Package, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUSES = [
  { value: "pending", label: "Pendente", color: "hsl(var(--admin-warning))" },
  { value: "processing", label: "Processando", color: "hsl(var(--admin-info))" },
  { value: "shipped", label: "Enviado", color: "hsl(152, 56%, 48%)" },
  { value: "delivered", label: "Entregue", color: "hsl(var(--admin-success))" },
  { value: "cancelled", label: "Cancelado", color: "hsl(var(--destructive))" },
];

type OrderForm = {
  customer_name: string; customer_email: string; customer_phone: string;
  status: string; total: string; currency: string; notes: string;
  items: string;
};

const empty: OrderForm = {
  customer_name: "", customer_email: "", customer_phone: "",
  status: "pending", total: "0", currency: "EUR", notes: "", items: "[]",
};

const useOrders = () => useQuery({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useOrders();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OrderForm>(empty);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editId) {
        const { error } = await supabase.from("orders").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOpen(false);
      toast.success(editId ? "Pedido atualizado!" : "Pedido criado!");
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (o: any) => {
    setForm({
      customer_name: o.customer_name, customer_email: o.customer_email,
      customer_phone: o.customer_phone || "", status: o.status,
      total: String(o.total), currency: o.currency, notes: o.notes || "",
      items: JSON.stringify(o.items, null, 2),
    });
    setEditId(o.id);
    setOpen(true);
  };

  const handleSave = () => {
    let items;
    try { items = JSON.parse(form.items); } catch { items = []; }
    saveMutation.mutate({
      customer_name: form.customer_name, customer_email: form.customer_email,
      customer_phone: form.customer_phone || null, status: form.status,
      total: parseFloat(form.total) || 0, currency: form.currency,
      notes: form.notes || null, items,
    });
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const filtered = orders?.filter(o => {
    const matchesSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      String(o.order_number).includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Pedidos</h1>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Criar pedido
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="p-3 border-b border-[hsl(var(--admin-border))] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar pedidos..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-[13px] border-0 bg-[hsl(var(--admin-bg))] rounded-lg" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Pedido</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Data</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Cliente</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Status</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5">Total</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {filtered?.map((o) => {
                const status = STATUSES.find(s => s.value === o.status);
                return (
                  <tr key={o.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group" onClick={() => setViewOrder(o)}>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] font-medium text-[hsl(var(--admin-info))]">#{o.order_number}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[13px] font-medium">{o.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${status?.color}15`, color: status?.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status?.color }} />
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[13px] font-medium">€{Number(o.total).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setViewOrder(o)}><Eye className="h-3.5 w-3.5 mr-2" /> Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(o)}>Editar</DropdownMenuItem>
                          {STATUSES.filter(s => s.value !== o.status).map(s => (
                            <DropdownMenuItem key={s.value} onClick={() => updateStatus.mutate({ id: o.id, status: s.value })}>
                              Marcar como {s.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filtered?.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12">
                  <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Nenhum pedido encontrado</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "pedido" : "pedidos"}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Pedido #{viewOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{viewOrder.customer_name}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Email</span><span>{viewOrder.customer_email}</span></div>
                {viewOrder.customer_phone && <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Telefone</span><span>{viewOrder.customer_phone}</span></div>}
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Data</span><span>{new Date(viewOrder.created_at).toLocaleString("pt-BR")}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${STATUSES.find(s => s.value === viewOrder.status)?.color}15`, color: STATUSES.find(s => s.value === viewOrder.status)?.color }}>
                    {STATUSES.find(s => s.value === viewOrder.status)?.label}
                  </span>
                </div>
              </div>
              <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4">
                <div className="flex justify-between text-[15px] font-semibold">
                  <span>Total</span><span>€{Number(viewOrder.total).toFixed(2)}</span>
                </div>
              </div>
              {viewOrder.notes && (
                <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4">
                  <p className="text-[12px] text-muted-foreground mb-1">Notas</p>
                  <p className="text-[13px]">{viewOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Order Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Pedido" : "Criar Pedido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">Cliente</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5"><Label className="text-[12px]">Nome</Label><Input value={form.customer_name} onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))} className="h-9 text-[13px]" /></div>
                <div className="space-y-1.5"><Label className="text-[12px]">Email</Label><Input value={form.customer_email} onChange={(e) => setForm(f => ({ ...f, customer_email: e.target.value }))} className="h-9 text-[13px]" /></div>
                <div className="space-y-1.5"><Label className="text-[12px]">Telefone</Label><Input value={form.customer_phone} onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))} className="h-9 text-[13px]" /></div>
              </div>
            </div>
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">Detalhes</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-[12px]">Total (€)</Label><Input type="number" step="0.01" value={form.total} onChange={(e) => setForm(f => ({ ...f, total: e.target.value }))} className="h-9 text-[13px]" /></div>
                <div className="space-y-1.5"><Label className="text-[12px]">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-[12px]">Notas</Label><Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} className="text-[13px] min-h-[60px]" /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Criar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
