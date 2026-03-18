import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SettingDefinition } from "@/theme-engine/types";

interface SchemaFieldProps {
  setting: SettingDefinition;
  value: any;
  onChange: (value: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
  uploading?: boolean;
}

const SchemaField = ({ setting, value, onChange, onImageUpload, uploading }: SchemaFieldProps) => {
  const currentValue = value ?? setting.default ?? "";

  switch (setting.type) {
    case "select":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Select value={String(currentValue)} onValueChange={onChange}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(setting.options || []).map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {setting.info && <p className="text-[10px] text-muted-foreground">{setting.info}</p>}
        </div>
      );

    case "range":
      return (
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {currentValue}{setting.unit || ""}
            </span>
          </div>
          <Slider
            value={[parseFloat(String(currentValue)) || 0]}
            onValueChange={([v]) => onChange(v)}
            min={setting.min ?? 0}
            max={setting.max ?? 100}
            step={setting.step ?? 1}
          />
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[11px]">{setting.label}</p>
            {setting.info && <p className="text-[10px] text-muted-foreground">{setting.info}</p>}
          </div>
          <Switch
            checked={currentValue === true || currentValue === "true"}
            onCheckedChange={(v) => onChange(String(v))}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-7 text-[11px]"
            placeholder={setting.placeholder}
            min={setting.min}
            max={setting.max}
            step={setting.step}
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <div className="flex items-center gap-2">
            <label className="relative w-7 h-7 rounded-md border border-[hsl(var(--admin-border))] cursor-pointer overflow-hidden shrink-0">
              <input
                type="color"
                value={String(currentValue) || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full" style={{ backgroundColor: String(currentValue) || "#000000" }} />
            </label>
            <Input
              value={String(currentValue)}
              onChange={(e) => onChange(e.target.value)}
              className="h-7 text-[11px] flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <div className="space-y-1.5">
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="h-7 text-[10px]"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !onImageUpload) return;
                try {
                  const url = await onImageUpload(file);
                  onChange(url);
                } catch {}
              }}
            />
            {currentValue && (
              <img src={String(currentValue)} alt="" className="w-14 h-14 object-cover rounded border border-[hsl(var(--admin-border))]" />
            )}
          </div>
        </div>
      );

    case "textarea":
    case "richtext":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Textarea
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className={`text-[11px] ${setting.type === "richtext" ? "min-h-[120px]" : "min-h-[60px]"}`}
            placeholder={setting.placeholder || setting.label}
          />
        </div>
      );

    case "video_url":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Input
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 text-[11px]"
            placeholder={setting.placeholder || "https://youtube.com/watch?v=..."}
          />
        </div>
      );

    case "html":
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Textarea
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="text-[11px] min-h-[100px] font-mono"
            placeholder={setting.placeholder || "<div>HTML aqui</div>"}
          />
        </div>
      );

    case "text":
    case "url":
    default:
      return (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">{setting.label}</Label>
          <Input
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 text-[11px]"
            placeholder={setting.placeholder || setting.label}
          />
          {setting.info && <p className="text-[10px] text-muted-foreground">{setting.info}</p>}
        </div>
      );
  }
};

export default SchemaField;
