import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface CollectionItem {
  image: string;
  title: string;
  link: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseCollections(config: Json | null | undefined): CollectionItem[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "",
    title: b.title || "",
    link: b.link || "#",
  }));
}

interface Props { section?: HomepageSection; }

const CollectionListSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "";
  const subtitle = section?.subtitle || "";
  const columns = parseInt(String(cfg.columns || "3"));
  const items = parseCollections(section?.config);

  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section data-theme-section="collection-list" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {(heading || subtitle) && (
          <div className="text-center mb-12">
            {heading && <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>}
            {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${colClass} gap-6`}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={item.link} className="block group">
                <div className="aspect-square overflow-hidden mb-3 bg-muted/10">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Imagem</div>
                  )}
                </div>
                <h3 className="text-sm font-normal text-foreground text-center">{item.title}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CollectionListSection;
