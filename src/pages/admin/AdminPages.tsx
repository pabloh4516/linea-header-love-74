import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, ExternalLink, FileText, Shield } from "lucide-react";
import { toast } from "sonner";

type PageForm = {
  title: string;
  slug: string;
  content: string;
  page_type: string;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
};

const empty: PageForm = {
  title: "", slug: "", content: "", page_type: "custom",
  is_published: false, meta_title: "", meta_description: "",
};

const AdminPages = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PageForm>(empty);
  const [tab, setTab] = useState("policy");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages" as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title,
        slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        content: form.content || null,
        page_type: form.page_type,
        is_published: form.is_published,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };
      if (editId) {
        const { error } = await supabase.from("pages" as any).update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pages" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); setOpen(false); toast.success("Página salva!"); },
    onError: () => toast.error("Erro ao salvar página"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Página excluída!"); },
  });

  const openNew = (type: string) => { setForm({ ...empty, page_type: type }); setEditId(null); setOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      title: p.title, slug: p.slug, content: p.content || "",
      page_type: p.page_type, is_published: p.is_published,
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
    });
    setEditId(p.id);
    setOpen(true);
  };

  const policyPages = pages.filter((p: any) => p.page_type === "policy");
  const customPages = pages.filter((p: any) => p.page_type === "custom");

  const renderTable = (items: any[], type: string) => (
    <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--admin-border))]">
              <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Título</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">Slug</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-4 py-2.5">Status</th>
              <th className="text-right text-[12px] font-medium text-muted-foreground px-4 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--admin-border))]">
            {items.map((p: any) => (
              <tr key={p.id} className="hover:bg-[hsl(var(--admin-surface-hover))] transition-colors cursor-pointer" onClick={() => openEdit(p)}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {type === "policy" ? <Shield className="h-3.5 w-3.5 text-muted-foreground" /> : <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-[13px] font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-muted-foreground font-mono hidden md:table-cell">/{p.slug}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.is_published ? "bg-[hsl(var(--admin-success)/0.1)] text-[hsl(var(--admin-success))]" : "bg-muted text-muted-foreground"}`}>
                    {p.is_published ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(`/${p.slug}`, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                    {type === "custom" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Excluir?")) del.mutate(p.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted-foreground py-12 text-[13px]">Nenhuma página</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Páginas</h1>
          <p className="text-sm text-muted-foreground">Gerencie políticas e páginas customizadas</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="policy">Políticas</TabsTrigger>
          <TabsTrigger value="custom">Páginas customizadas</TabsTrigger>
        </TabsList>
        <TabsContent value="policy" className="mt-4">
          {renderTable(policyPages, "policy")}
        </TabsContent>
        <TabsContent value="custom" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openNew("custom")} size="sm" className="h-8 text-[13px] rounded-lg">
              <Plus className="h-3.5 w-3.5 mr-1" /> Nova página
            </Button>
          </div>
          {renderTable(customPages, "custom")}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader><DialogTitle className="text-[15px] font-semibold">{editId ? "Editar Página" : "Nova Página"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Título</Label>
                <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Slug (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ex: minha-pagina" className="h-9 text-[13px] font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Conteúdo</Label>
              <Textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} className="text-[13px] min-h-[250px] font-mono" placeholder="Suporta texto simples. Cada parágrafo em uma nova linha." />
            </div>
            <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">SEO</h3>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Meta título</Label>
                <Input value={form.meta_title} onChange={(e) => setForm(f => ({ ...f, meta_title: e.target.value }))} className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-muted-foreground">Meta descrição</Label>
                <Textarea value={form.meta_description} onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))} className="text-[13px] min-h-[60px]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[13px]">Publicada</Label>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm(f => ({ ...f, is_published: v }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[hsl(var(--admin-border))]">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-[13px] rounded-lg">Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} className="h-8 text-[13px] rounded-lg">{editId ? "Salvar" : "Criar página"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
