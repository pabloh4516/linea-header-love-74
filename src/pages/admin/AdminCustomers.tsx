import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CustomerForm = {
  name: string; email: string; phone: string; notes: string;
};
const empty: CustomerForm = { name: "", email: "", phone: "", notes: "" };

const useCustomers = () => useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(empty);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editId) {
        const { error } = await supabase.from("customers").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      toast.success(editId ? "Cliente atualizado!" : "Cliente adicionado!");
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente removido!");
    },
    onError: () => toast.error("Erro ao remover"),
  });

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name, email: c.email, phone: c.phone || "", notes: c.notes || "" });
    setEditId(c.id);
    setOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      name: form.name, email: form.email,
      phone: form.phone || null, notes: form.notes || null,
    });
  };

  const filtered = customers?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
        <Button onClick={openNew} size="sm" className="h-8 text-[13px] rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar cliente
        </Button>
      </div>

      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="p-3 border-b border-[hsl(var(--admin-border))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-[13px] border-0 bg-[hsl(var(--admin-bg))] rounded-lg" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]">
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Cliente</th>
                <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Email</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden sm:table-cell">Pedidos</th>
                <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5">Total Gasto</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--admin-border))]">
              {filtered?.map((c) => (
                <tr key={c.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer group" onClick={() => openEdit(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[hsl(var(--admin-bg))] flex items-center justify-center text-[12px] font-medium text-muted-foreground">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground md:hidden">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[13px] text-muted-foreground">{c.email}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-[13px]">{c.total_orders}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[13px] font-medium">€{Number(c.total_spent).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { if (confirm("Remover cliente?")) deleteMutation.mutate(c.id); }} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Nenhum cliente encontrado</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[hsl(var(--admin-border))] text-[12px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
            <div className="space-y-1.5"><Label className="text-[13px]">Nome</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-[13px]" /></div>
            <div className="space-y-1.5"><Label className="text-[13px]">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="h-9 text-[13px]" /></div>
            <div className="space-y-1.5"><Label className="text-[13px]">Telefone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-[13px]" /></div>
            <div className="space-y-1.5"><Label className="text-[13px]">Notas</Label><Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} className="text-[13px] min-h-[60px]" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Descartar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Adicionar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
