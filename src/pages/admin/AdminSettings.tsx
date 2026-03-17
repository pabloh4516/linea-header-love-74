import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SETTINGS_FIELDS = [
  { key: "store_name", label: "Nome da Loja", placeholder: "Linea Jewelry" },
  { key: "logo_url", label: "URL do Logo", placeholder: "/Linea_Jewelry_Inc-2.svg" },
  { key: "status_bar_text", label: "Texto do Status Bar", placeholder: "Complimentary shipping on all orders" },
  { key: "status_bar_link_text", label: "Texto do Link (Status Bar)", placeholder: "Explore more" },
  { key: "status_bar_link_url", label: "URL do Link (Status Bar)", placeholder: "/category/all" },
  { key: "currency", label: "Moeda", placeholder: "EUR" },
  { key: "currency_symbol", label: "Símbolo da Moeda", placeholder: "€" },
  { key: "contact_email", label: "Email de Contato", placeholder: "hello@linea.com" },
  { key: "contact_phone", label: "Telefone", placeholder: "+1 (555) 000-0000" },
  { key: "footer_tagline", label: "Tagline do Footer", placeholder: "Contemporary jewelry..." },
];

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      for (const field of SETTINGS_FIELDS) {
        if (values[field.key] !== (settings?.[field.key] || "")) {
          await updateSetting.mutateAsync({ key: field.key, value: values[field.key] || "" });
        }
      }
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-light">Configurações</h1>
      <div className="space-y-4">
        {SETTINGS_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={values[field.key] || ""}
              onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={updateSetting.isPending}>
        Salvar Configurações
      </Button>
    </div>
  );
};

export default AdminSettings;
