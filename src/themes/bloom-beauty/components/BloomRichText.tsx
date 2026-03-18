import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "@/components/content/SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function cfg(c: Json | null | undefined): Record<string, string> {
  if (!c || typeof c !== "object" || Array.isArray(c)) return {};
  return c as Record<string, string>;
}

const BloomRichText = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const config = cfg(section?.config);

  const heading = section?.title || "";
  const content = section?.description || "Adicione seu texto aqui.";
  const alignment = config.alignment || "center";
  const size = config.size || "normal"; // normal | large

  return (
    <section ref={ref} data-theme-section="rich-text" className="py-20 md:py-28 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-3xl mx-auto ${alignment === "center" ? "text-center" : "text-left"}`}
      >
        {heading && (
          <h2 className={`text-display text-foreground mb-6 ${size === "large" ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"}`}>
            {heading}
          </h2>
        )}
        <div className={`font-light text-muted-foreground leading-relaxed whitespace-pre-line ${size === "large" ? "text-base md:text-lg" : "text-sm md:text-base"}`}>
          {content}
        </div>
      </motion.div>
    </section>
  );
};

export default BloomRichText;
