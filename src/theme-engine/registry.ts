import type { ThemeRegistration, SectionRegistration, SectionSchema } from "./types";

class ThemeRegistry {
  private themes: Map<string, ThemeRegistration> = new Map();
  private activeThemeId: string | null = null;

  register(theme: ThemeRegistration) {
    this.themes.set(theme.id, theme);
    if (!this.activeThemeId) this.activeThemeId = theme.id;
  }

  setActive(id: string) {
    if (this.themes.has(id)) this.activeThemeId = id;
  }

  getActive(): ThemeRegistration | null {
    return this.activeThemeId ? this.themes.get(this.activeThemeId) || null : null;
  }

  getSection(type: string): SectionRegistration | null {
    return this.getActive()?.sections[type] || null;
  }

  getSectionSchema(type: string): SectionSchema | null {
    return this.getActive()?.sections[type]?.schema || null;
  }

  getAvailableSections(): Array<{ type: string; name: string; icon?: string; schema: SectionSchema }> {
    const theme = this.getActive();
    if (!theme) return [];
    return Object.entries(theme.sections).map(([type, reg]) => ({
      type,
      name: reg.schema.name,
      icon: reg.schema.icon,
      schema: reg.schema,
    }));
  }

  getGlobalSettingsSchema() {
    return this.getActive()?.globalSettingsSchema || [];
  }

  getDefaultSettings() {
    return this.getActive()?.defaultSettings || {};
  }

  getTemplates() {
    return this.getActive()?.templates || {};
  }

  listThemes() {
    return Array.from(this.themes.values()).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      author: t.author,
    }));
  }
}

export const themeRegistry = new ThemeRegistry();
