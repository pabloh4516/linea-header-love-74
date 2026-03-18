import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface FaqItem {
  question: string;
  answer: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseItems(config: Json | null | undefined): FaqItem[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    question: b.question || "",
    answer: b.answer || "",
  }));
}

interface Props { section?: HomepageSection; }

const CollapsibleContentSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "Perguntas Frequentes";
  const subtitle = section?.subtitle || "";
  const layout = String(cfg.layout || "full");
  const items = parseItems(section?.config);

  const isSideBySide = layout === "side-by-side";

  return (
    <section data-theme-section="collapsible-content" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={isSideBySide ? "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 max-w-5xl mx-auto" : "max-w-3xl mx-auto"}
      >
        <div className={isSideBySide ? "md:col-span-4" : "text-center mb-10"}>
          <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>
          {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
        </div>

        <div className={isSideBySide ? "md:col-span-8" : ""}>
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-sm font-normal text-foreground hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-light text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
};

export default CollapsibleContentSection;
