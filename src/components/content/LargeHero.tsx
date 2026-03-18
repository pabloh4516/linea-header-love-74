import heroImage from "@/assets/hero-image.png";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props { section?: HomepageSection; }

const LargeHero = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const image = section?.image_url || heroImage;
  const title = section?.title || "Herança Moderna";
  const subtitle = section?.subtitle || "Joias contemporâneas criadas com elegância atemporal";
  const ctaText = section?.cta_text || cfg.cta_text || "";
  const linkUrl = section?.link_url || cfg.link_url || "#";

  return (
    <section data-theme-section="large-hero" className="w-full mb-16 px-6">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full aspect-[16/9] mb-3 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-sm font-normal text-foreground mb-1">{title}</h2>
          <p className="text-sm font-light text-foreground">{subtitle}</p>
          {ctaText && (
            <Link to={linkUrl} className="inline-flex items-center text-sm font-light text-foreground mt-2 border-b border-foreground/30 pb-0.5 hover:border-foreground transition-colors">
              {ctaText}
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default LargeHero;
