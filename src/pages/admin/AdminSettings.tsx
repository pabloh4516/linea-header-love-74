import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

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

  useEffect(() => {
    if (settings) setValues(settings);
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
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    }
    setSaving(false);
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
    </div>
  );
};

export default AdminSettings;
