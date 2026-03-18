import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props { section?: HomepageSection; }

const RichTextSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "";
  const content = section?.description || "Adicione seu texto aqui.";
  const alignment = cfg.alignment || "center";
  const padding = parseInt(cfg.padding || "80");

  return (
    <section data-theme-section="rich-text" style={{ paddingTop: `${padding}px`, paddingBottom: `${padding}px` }} className="px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-3xl mx-auto ${alignment === "center" ? "text-center" : "text-left"}`}
      >
        {heading && (
          <h2 className="text-display text-2xl md:text-4xl text-foreground mb-6">{heading}</h2>
        )}
        <div className="text-sm md:text-base font-light text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </motion.div>
    </section>
  );
};

export default RichTextSection;
