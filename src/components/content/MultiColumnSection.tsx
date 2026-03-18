import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface Column {
  image: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseColumns(config: Json | null | undefined): Column[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "",
    title: b.title || "",
    description: b.description || "",
    button_text: b.button_text || "",
    button_link: b.button_link || "#",
  }));
}

interface Props { section?: HomepageSection; }

const MultiColumnSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "";
  const subtitle = section?.subtitle || "";
  const columns = parseInt(String(cfg.columns || "3"));
  const alignment = String(cfg.alignment || "center");
  const items = parseColumns(section?.config);

  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section data-theme-section="multicolumn" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {(heading || subtitle) && (
          <div className={`mb-12 ${alignment === "center" ? "text-center" : "text-left"}`}>
            {heading && <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>}
            {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className={`grid grid-cols-1 ${colClass} gap-8`}>
          {items.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={alignment === "center" ? "text-center" : "text-left"}
            >
              {col.image && (
                <div className="aspect-square overflow-hidden mb-4 bg-muted/10">
                  <img src={col.image} alt={col.title} className="w-full h-full object-cover" />
                </div>
              )}
              {col.title && <h3 className="text-display text-lg text-foreground mb-2">{col.title}</h3>}
              {col.description && <p className="text-sm font-light text-muted-foreground leading-relaxed mb-4">{col.description}</p>}
              {col.button_text && (
                <Link to={col.button_link}
                  className="inline-flex items-center text-sm font-light text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300">
                  {col.button_text}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default MultiColumnSection;
