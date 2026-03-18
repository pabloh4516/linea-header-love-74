import { useState } from "react";
import { useProductVariants, useCreateVariant, useDeleteVariant } from "@/hooks/useVariants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const VARIANT_TYPES = [
  { value: "Tamanho", label: "Tamanho" },
  { value: "Cor", label: "Cor" },
  { value: "Material", label: "Material" },
  { value: "Acabamento", label: "Acabamento" },
];

interface VariantManagerProps {
  productId: string;
}

const VariantManager = ({ productId }: VariantManagerProps) => {
  const { data: variants, isLoading } = useProductVariants(productId);
  const createVariant = useCreateVariant();
  const deleteVariant = useDeleteVariant();

  const [adding, setAdding] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variant_type: "Tamanho",
    variant_value: "",
    price_adjustment: "0",
    sku_suffix: "",
    stock: "0",
    is_available: true,
  });

  const handleAdd = async () => {
    if (!newVariant.variant_value.trim()) {
      toast.error("Preencha o valor da variante");
      return;
    }
    try {
      await createVariant.mutateAsync({
        product_id: productId,
        variant_type: newVariant.variant_type,
        variant_value: newVariant.variant_value,
        price_adjustment: parseFloat(newVariant.price_adjustment) || 0,
        sku_suffix: newVariant.sku_suffix || null,
        stock: parseInt(newVariant.stock) || 0,
        sort_order: (variants?.length ?? 0),
        is_available: newVariant.is_available,
      });
      toast.success("Variante adicionada!");
      setNewVariant({ variant_type: "Tamanho", variant_value: "", price_adjustment: "0", sku_suffix: "", stock: "0", is_available: true });
      setAdding(false);
    } catch {
      toast.error("Erro ao adicionar variante");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVariant.mutateAsync(id);
      toast.success("Variante removida!");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  // Group variants by type
  const grouped = variants?.reduce((acc, v) => {
    if (!acc[v.variant_type]) acc[v.variant_type] = [];
    acc[v.variant_type].push(v);
    return acc;
  }, {} as Record<string, typeof variants>);

  return (
    <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">Variantes</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding(!adding)}
          className="h-7 text-[12px] rounded-lg"
        >
          <Plus className="h-3 w-3 mr-1" /> Adicionar
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
        </div>
      )}

      {adding && (
        <div className="border border-[hsl(var(--admin-border))] rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Tipo</Label>
              <Select value={newVariant.variant_type} onValueChange={(v) => setNewVariant(nv => ({ ...nv, variant_type: v }))}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VARIANT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Valor</Label>
              <Input
                value={newVariant.variant_value}
                onChange={(e) => setNewVariant(nv => ({ ...nv, variant_value: e.target.value }))}
                placeholder="Ex: P, M, G ou Dourado"
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ajuste de preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newVariant.price_adjustment}
                onChange={(e) => setNewVariant(nv => ({ ...nv, price_adjustment: e.target.value }))}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Estoque</Label>
              <Input
                type="number"
                value={newVariant.stock}
                onChange={(e) => setNewVariant(nv => ({ ...nv, stock: e.target.value }))}
                className="h-8 text-[12px]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={newVariant.is_available}
                onCheckedChange={(v) => setNewVariant(nv => ({ ...nv, is_available: v }))}
              />
              <span className="text-[12px]">Disponível</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-7 text-[12px]">Cancelar</Button>
              <Button size="sm" onClick={handleAdd} disabled={createVariant.isPending} className="h-7 text-[12px]">Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {grouped && Object.entries(grouped).length > 0 ? (
        Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">{type}</p>
            <div className="space-y-1">
              {items!.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[hsl(var(--admin-surface))] group">
                  <div className="flex items-center gap-3">
                    <span className={`text-[13px] ${v.is_available ? '' : 'text-muted-foreground line-through'}`}>
                      {v.variant_value}
                    </span>
                    {v.price_adjustment !== 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {v.price_adjustment > 0 ? '+' : ''}R${Number(v.price_adjustment).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      Estoque: {v.stock}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(v.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        !isLoading && !adding && (
          <p className="text-[12px] text-muted-foreground text-center py-3">
            Nenhuma variante adicionada
          </p>
        )
      )}
    </div>
  );
};

export default VariantManager;
