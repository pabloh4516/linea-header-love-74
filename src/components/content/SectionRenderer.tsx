import { themeRegistry } from "@/theme-engine";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useThemeSync } from "@/hooks/useActiveThemeSync";

export type { Database } from "@/integrations/supabase/types";
export type HomepageSection = import("@/integrations/supabase/types").Database["public"]["Tables"]["homepage_sections"]["Row"];

const SectionRenderer = () => {
  const { activeThemeId } = useThemeSync(); // Forces re-render when theme changes
  const { data: sections, isLoading } = useHomepageSections(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => {
        const registration = themeRegistry.getSection(section.section_type);
        if (!registration) return null;
        const Component = registration.component;
        return <Component key={section.id} section={section} />;
      })}
    </>
  );
};

export default SectionRenderer;
