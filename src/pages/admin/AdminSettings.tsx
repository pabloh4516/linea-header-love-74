import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
}

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "standard", name: "Envio Padrão", price: 0, estimatedDays: "5-8 dias úteis", enabled: true },
  { id: "express", name: "Envio Expresso", price: 25, estimatedDays: "2-3 dias úteis", enabled: true },
  { id: "overnight", name: "Entrega no Dia Seguinte", price: 60, estimatedDays: "Próximo dia útil", enabled: true },
];

const SETTINGS_GROUPS = [
  {
    title: "Informações da Loja",
    fields: [
      { key: "store_name", label: "Nome da Loja", placeholder: "Linea Jewelry" },
      { key: "logo_url", label: "URL do Logo", placeholder: "/Linea_Jewelry_Inc-2.svg" },
      { key: "contact_email", label: "Email de Contato", placeholder: "hello@linea.com" },
      { key: "contact_phone", label: "Telefone", placeholder: "+1 (555) 000-0000" },
    ],
  },
  {
    title: "Moeda",
    fields: [
      { key: "currency", label: "Código da Moeda", placeholder: "BRL" },
      { key: "currency_symbol", label: "Símbolo", placeholder: "R$" },
    ],
  },
  {
    title: "Barra de Status",
    fields: [
      { key: "status_bar_text", label: "Texto", placeholder: "Complimentary shipping on all orders" },
      { key: "status_bar_link_text", label: "Texto do Link", placeholder: "Explore more" },
      { key: "status_bar_link_url", label: "URL do Link", placeholder: "/category/all" },
    ],
  },
  {
    title: "Rodapé",
    fields: [
      { key: "footer_tagline", label: "Tagline", placeholder: "Contemporary jewelry..." },
    ],
  },
];

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(DEFAULT_SHIPPING);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("250");

  useEffect(() => {
    if (settings) {
      setValues(settings);
      if (settings.shipping_options) {
        try {
          setShippingOptions(JSON.parse(settings.shipping_options));
        } catch { /* use defaults */ }
      }
      setFreeShippingEnabled(settings.shipping_free_enabled === "true");
      setFreeShippingThreshold(settings.shipping_free_threshold || "250");
    }
  }, [settings]);

  const allFields = SETTINGS_GROUPS.flatMap(g => g.fields);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save regular fields
      for (const field of allFields) {
        if (values[field.key] !== (settings?.[field.key] || "")) {
          await updateSetting.mutateAsync({ key: field.key, value: values[field.key] || "" });
        }
      }
      // Save shipping config
      await updateSetting.mutateAsync({ key: "shipping_options", value: JSON.stringify(shippingOptions) });
      await updateSetting.mutateAsync({ key: "shipping_free_enabled", value: String(freeShippingEnabled) });
      await updateSetting.mutateAsync({ key: "shipping_free_threshold", value: freeShippingThreshold });

      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    }
    setSaving(false);
  };

  const addShippingOption = () => {
    setShippingOptions(prev => [
      ...prev,
      {
        id: `shipping_${Date.now()}`,
        name: "Nova Opção",
        price: 0,
        estimatedDays: "3-5 dias úteis",
        enabled: true,
      },
    ]);
  };

  const updateShipping = (index: number, field: keyof ShippingOption, value: string | number | boolean) => {
    setShippingOptions(prev =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const removeShipping = (index: number) => {
    setShippingOptions(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Configure as informações gerais da sua loja.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-[13px] rounded-lg">
          <Save className="h-3.5 w-3.5 mr-1" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title} className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
          <div className="px-5 py-4 border-b border-[hsl(var(--admin-border))]">
            <h2 className="text-[14px] font-semibold">{group.title}</h2>
          </div>
          <div className="p-5 space-y-4">
            {group.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-[13px]">{field.label}</Label>
                <Input
                  value={values[field.key] || ""}
                  onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-9 text-[13px]"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Shipping Configuration */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="px-5 py-4 border-b border-[hsl(var(--admin-border))] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold">Opções de Frete</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Configure as opções de envio disponíveis no checkout.</p>
          </div>
          <Button onClick={addShippingOption} size="sm" variant="outline" className="h-7 text-[12px] rounded-lg gap-1">
            <Plus className="h-3 w-3" />
            Adicionar
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {/* Free shipping threshold */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-muted/30">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium">Frete grátis automático</p>
              <p className="text-[11px] text-muted-foreground">Oferecer frete grátis acima de um valor mínimo</p>
            </div>
            <Switch checked={freeShippingEnabled} onCheckedChange={setFreeShippingEnabled} />
          </div>

          {freeShippingEnabled && (
            <div className="space-y-1.5 pl-4 border-l-2 border-primary/20">
              <Label className="text-[13px]">Valor mínimo para frete grátis (R$)</Label>
              <Input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="250"
                className="h-9 text-[13px] w-40"
              />
            </div>
          )}

          {/* Shipping options list */}
          <div className="space-y-3">
            {shippingOptions.map((option, index) => (
              <div
                key={option.id}
                className="p-4 rounded-lg border border-[hsl(var(--admin-border))] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <Switch
                      checked={option.enabled}
                      onCheckedChange={(v) => updateShipping(index, "enabled", v)}
                    />
                    <span className="text-[13px] font-medium">{option.name || "Sem nome"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeShipping(index)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Nome</Label>
                    <Input
                      value={option.name}
                      onChange={(e) => updateShipping(index, "name", e.target.value)}
                      className="h-8 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Preço (R$)</Label>
                    <Input
                      type="number"
                      value={option.price}
                      onChange={(e) => updateShipping(index, "price", parseFloat(e.target.value) || 0)}
                      className="h-8 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Prazo</Label>
                    <Input
                      value={option.estimatedDays}
                      onChange={(e) => updateShipping(index, "estimatedDays", e.target.value)}
                      placeholder="3-5 dias úteis"
                      className="h-8 text-[13px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
