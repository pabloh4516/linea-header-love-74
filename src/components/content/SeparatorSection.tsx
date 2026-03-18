import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props { section?: HomepageSection; }

const SeparatorSection = ({ section }: Props) => {
  const cfg = getConfig(section?.config);
  const paddingTop = parseInt(cfg.padding_top || "40");
  const paddingBottom = parseInt(cfg.padding_bottom || "40");
  const showLine = cfg.show_line !== "false";

  return (
    <div
      data-theme-section="separator"
      style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
      className="px-6 md:px-12"
    >
      {showLine && <div className="border-t border-border" />}
    </div>
  );
};

export default SeparatorSection;
