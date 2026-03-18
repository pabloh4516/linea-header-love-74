import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface TextItem {
  content: string;
  link: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseItems(config: Json | null | undefined): TextItem[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    content: b.content || "",
    link: b.link || "",
  }));
}

interface Props { section?: HomepageSection; }

const MarqueeSection = ({ section }: Props) => {
  const cfg = getConfig(section?.config);
  const speed = parseInt(String(cfg.speed || "30"));
  const pauseOnHover = String(cfg.pause_on_hover) !== "false";
  const size = String(cfg.size || "md");
  const items = parseItems(section?.config);

  if (items.length === 0) {
    return (
      <section data-theme-section="marquee" className="py-6 px-6 text-center">
        <p className="text-sm text-muted-foreground">Adicione textos ao marquee.</p>
      </section>
    );
  }

  const sizeClass = {
    sm: "text-sm",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-5xl",
    xl: "text-5xl md:text-7xl",
  }[size] || "text-xl md:text-2xl";

  // Repeat items enough to fill
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <section
      data-theme-section="marquee"
      className="py-6 md:py-8 overflow-hidden border-y border-border"
    >
      <div
        className={`flex items-center whitespace-nowrap ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            {item.link ? (
              <Link
                to={item.link}
                className={`${sizeClass} font-light text-foreground hover:text-foreground/70 transition-colors px-4 md:px-8`}
              >
                {item.content}
              </Link>
            ) : (
              <span className={`${sizeClass} font-light text-foreground px-4 md:px-8`}>
                {item.content}
              </span>
            )}
            <span className="text-muted-foreground/30 px-2 md:px-4">•</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default MarqueeSection;
