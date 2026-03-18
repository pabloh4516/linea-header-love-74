import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface LogoItem {
  image: string;
  alt_text: string;
  link: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseLogos(config: Json | null | undefined): LogoItem[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "",
    alt_text: b.alt_text || "",
    link: b.link || "",
  }));
}

interface Props { section?: HomepageSection; }

const LogoListSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const heading = section?.title || "";
  const subtitle = section?.subtitle || "";
  const logos = parseLogos(section?.config);

  return (
    <section data-theme-section="logo-list" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        {(heading || subtitle) && (
          <div className="text-center mb-10">
            {heading && <h2 className="text-display text-xl md:text-2xl text-foreground mb-2">{heading}</h2>}
            {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, i) => {
            const content = (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-10 md:h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              >
                {logo.image ? (
                  <img src={logo.image} alt={logo.alt_text} className="h-full w-auto object-contain" />
                ) : (
                  <div className="h-full w-20 bg-muted/20 rounded flex items-center justify-center text-[10px] text-muted-foreground">Logo</div>
                )}
              </motion.div>
            );
            return logo.link ? (
              <a key={i} href={logo.link} target="_blank" rel="noopener noreferrer">{content}</a>
            ) : content;
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default LogoListSection;
