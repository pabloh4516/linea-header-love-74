import type { ComponentType } from "react";

export type SettingType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "url"
  | "color"
  | "range"
  | "select"
  | "checkbox"
  | "number"
  | "video_url"
  | "html";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingDefinition {
  type: SettingType;
  id: string;
  label: string;
  default?: string | number | boolean;
  placeholder?: string;
  info?: string;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface BlockSchema {
  type: string;
  name: string;
  limit?: number;
  settings: SettingDefinition[];
}

export interface SectionSchema {
  name: string;
  icon?: string;
  settings: SettingDefinition[];
  blocks?: BlockSchema[];
  presets?: Array<{
    name: string;
    settings?: Record<string, any>;
    blocks?: Array<{ type: string; settings?: Record<string, any> }>;
  }>;
}

export interface SectionRegistration {
  component: ComponentType<any>;
  schema: SectionSchema;
}

export interface ThemeRegistration {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version?: string;
  sections: Record<string, SectionRegistration>;
  globalSettingsSchema: Array<{ name: string; settings: SettingDefinition[] }>;
  defaultSettings: Record<string, any>;
  templates: Record<string, { name: string; defaultSections: string[] }>;
}
