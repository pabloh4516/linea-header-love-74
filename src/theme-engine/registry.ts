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

  private getTheme(themeId?: string): ThemeRegistration | null {
    const resolvedId = themeId ?? this.activeThemeId;
    return resolvedId ? this.themes.get(resolvedId) || null : null;
  }

  getActive(): ThemeRegistration | null {
    return this.getTheme();
  }

  getSection(type: string, themeId?: string): SectionRegistration | null {
    return this.getTheme(themeId)?.sections[type] || null;
  }

  getSectionSchema(type: string, themeId?: string): SectionSchema | null {
    return this.getTheme(themeId)?.sections[type]?.schema || null;
  }

  getAvailableSections(themeId?: string): Array<{ type: string; name: string; icon?: string; schema: SectionSchema }> {
    const theme = this.getTheme(themeId);
    if (!theme) return [];
    return Object.entries(theme.sections).map(([type, reg]) => ({
      type,
      name: reg.schema.name,
      icon: reg.schema.icon,
      schema: reg.schema,
    }));
  }

  getGlobalSettingsSchema(themeId?: string) {
    return this.getTheme(themeId)?.globalSettingsSchema || [];
  }

  getDefaultSettings(themeId?: string) {
    return this.getTheme(themeId)?.defaultSettings || {};
  }

  getTemplates(themeId?: string) {
    return this.getTheme(themeId)?.templates || {};
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
