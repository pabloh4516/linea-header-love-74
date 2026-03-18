import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "@/components/content/SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function cfg(c: Json | null | undefined): Record<string, string> {
  if (!c || typeof c !== "object" || Array.isArray(c)) return {};
  return c as Record<string, string>;
}

const BloomFiftyFifty = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const config = cfg(section?.config);

  const heading = section?.title || "Rotina simplificada";
  const desc = section?.description || "Três passos. Manhã e noite. Resultados reais.";
  const cta = section?.cta_text || "Descobrir";
  const link = section?.link_url || "#";
  const image = section?.image_url || "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80";
  const reverse = config.reverse === "true";

  return (
    <section ref={ref} data-theme-section="fifty_fifty" className="py-0">
      <div className={`grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] ${reverse ? "" : ""}`}>
        {/* Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className={`relative overflow-hidden min-h-[40vh] ${reverse ? "lg:order-2" : ""}`}
        >
          <img src={image} alt={heading} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16 bg-background ${reverse ? "lg:order-1" : ""}`}
        >
          <h2 className="text-display text-3xl md:text-4xl text-foreground leading-[1.2] mb-6">{heading}</h2>
          <p className="text-sm md:text-base font-light text-muted-foreground leading-relaxed mb-8 max-w-md">{desc}</p>
          {cta && (
            <Link
              to={link}
              className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-foreground group self-start"
            >
              <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors duration-500">
                {cta}
              </span>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default BloomFiftyFifty;
