import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
type RuleType = "subtotal" | "weight" | "quantity" | "region";

interface ShippingRule {
  id: string;
  type: RuleType;
  min?: number;
  max?: number;
  regions?: string[];
  price: number;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
  rules?: ShippingRule[];
}

const RULE_LABELS: Record<RuleType, string> = {
  subtotal: "Valor do pedido (R$)",
  weight: "Peso (kg)",
  quantity: "Quantidade de itens",
  region: "Região / Estado",
};

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "standard", name: "Envio Padrão", price: 0, estimatedDays: "5-8 dias úteis", enabled: true, rules: [] },
  { id: "express", name: "Envio Expresso", price: 25, estimatedDays: "2-3 dias úteis", enabled: true, rules: [] },
  { id: "overnight", name: "Entrega no Dia Seguinte", price: 60, estimatedDays: "Próximo dia útil", enabled: true, rules: [] },
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

// ─── Rule Editor Component ────────────────────────────────
const ShippingRuleEditor = ({
  rule,
  onChange,
  onRemove,
}: {
  rule: ShippingRule;
  onChange: (updated: ShippingRule) => void;
  onRemove: () => void;
}) => {
  const isRegion = rule.type === "region";

  const toggleRegion = (state: string) => {
    const current = rule.regions || [];
    const next = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    onChange({ ...rule, regions: next });
  };

  return (
    <div className="p-3 rounded-md border border-[hsl(var(--admin-border))] bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {RULE_LABELS[rule.type]}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {isRegion ? (
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Estados (clique para selecionar)</Label>
          <div className="flex flex-wrap gap-1.5">
            {BRAZILIAN_STATES.map(state => {
              const selected = (rule.regions || []).includes(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => toggleRegion(state)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-[hsl(var(--admin-border))] hover:border-foreground/40"
                  }`}
                >
                  {state}
                </button>
              );
            })}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Preço (R$)</Label>
            <Input
              type="number"
              value={rule.price}
              onChange={(e) => onChange({ ...rule, price: parseFloat(e.target.value) || 0 })}
              className="h-7 text-[12px] w-28"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Mín</Label>
            <Input
              type="number"
              value={rule.min ?? ""}
              onChange={(e) => onChange({ ...rule, min: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
              placeholder="0"
              className="h-7 text-[12px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Máx</Label>
            <Input
              type="number"
              value={rule.max ?? ""}
              onChange={(e) => onChange({ ...rule, max: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
              placeholder="∞"
              className="h-7 text-[12px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Preço (R$)</Label>
            <Input
              type="number"
              value={rule.price}
              onChange={(e) => onChange({ ...rule, price: parseFloat(e.target.value) || 0 })}
              className="h-7 text-[12px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────
const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(DEFAULT_SHIPPING);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("250");
  const [expandedShipping, setExpandedShipping] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setValues(settings);
      if (settings.shipping_options) {
        try {
          const parsed = JSON.parse(settings.shipping_options) as ShippingOption[];
          // Ensure rules array exists on each option
          setShippingOptions(parsed.map(o => ({ ...o, rules: o.rules || [] })));
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
      for (const field of allFields) {
        if (values[field.key] !== (settings?.[field.key] || "")) {
          await updateSetting.mutateAsync({ key: field.key, value: values[field.key] || "" });
        }
      }
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
        rules: [],
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

  // ── Rule helpers ──
  const addRule = (optionIndex: number, type: RuleType) => {
    setShippingOptions(prev =>
      prev.map((opt, i) => {
        if (i !== optionIndex) return opt;
        const newRule: ShippingRule = {
          id: `rule_${Date.now()}`,
          type,
          price: 0,
          ...(type === "region" ? { regions: [] } : { min: undefined, max: undefined }),
        };
        return { ...opt, rules: [...(opt.rules || []), newRule] };
      })
    );
  };

  const updateRule = (optionIndex: number, ruleIndex: number, updated: ShippingRule) => {
    setShippingOptions(prev =>
      prev.map((opt, i) => {
        if (i !== optionIndex) return opt;
        const rules = [...(opt.rules || [])];
        rules[ruleIndex] = updated;
        return { ...opt, rules };
      })
    );
  };

  const removeRule = (optionIndex: number, ruleIndex: number) => {
    setShippingOptions(prev =>
      prev.map((opt, i) => {
        if (i !== optionIndex) return opt;
        return { ...opt, rules: (opt.rules || []).filter((_, ri) => ri !== ruleIndex) };
      })
    );
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

      {/* ── Shipping Configuration ── */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="px-5 py-4 border-b border-[hsl(var(--admin-border))] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold">Opções de Frete</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Configure as opções de envio e condições de preço.</p>
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
            {shippingOptions.map((option, index) => {
              const isExpanded = expandedShipping === option.id;
              const rulesCount = (option.rules || []).length;

              return (
                <div
                  key={option.id}
                  className="rounded-lg border border-[hsl(var(--admin-border))] overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                        <Switch
                          checked={option.enabled}
                          onCheckedChange={(v) => updateShipping(index, "enabled", v)}
                        />
                        <span className="text-[13px] font-medium">{option.name || "Sem nome"}</span>
                        {rulesCount > 0 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            {rulesCount} {rulesCount === 1 ? "condição" : "condições"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedShipping(isExpanded ? null : option.id)}
                          className="h-7 px-2 text-[11px] text-muted-foreground gap-1"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          Condições
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeShipping(index)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
                        <Label className="text-[11px] text-muted-foreground">Preço base (R$)</Label>
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

                  {/* Expandable rules section */}
                  {isExpanded && (
                    <div className="border-t border-[hsl(var(--admin-border))] bg-muted/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[12px] font-medium">Condições de preço</p>
                          <p className="text-[11px] text-muted-foreground">
                            Quando uma condição é atendida, o preço da condição substitui o preço base.
                          </p>
                        </div>
                        <Select onValueChange={(v) => addRule(index, v as RuleType)}>
                          <SelectTrigger className="h-7 w-auto text-[11px] gap-1 rounded-md">
                            <Plus className="h-3 w-3" />
                            <SelectValue placeholder="Adicionar condição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subtotal">Por valor do pedido</SelectItem>
                            <SelectItem value="weight">Por peso</SelectItem>
                            <SelectItem value="quantity">Por quantidade de itens</SelectItem>
                            <SelectItem value="region">Por região / estado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(option.rules || []).length === 0 && (
                        <p className="text-[11px] text-muted-foreground text-center py-4">
                          Nenhuma condição configurada. O preço base será aplicado.
                        </p>
                      )}

                      {(option.rules || []).map((rule, ruleIndex) => (
                        <ShippingRuleEditor
                          key={rule.id}
                          rule={rule}
                          onChange={(updated) => updateRule(index, ruleIndex, updated)}
                          onRemove={() => removeRule(index, ruleIndex)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
