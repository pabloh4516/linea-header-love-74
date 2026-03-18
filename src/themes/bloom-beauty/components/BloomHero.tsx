import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "@/components/content/SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function cfg(c: Json | null | undefined): Record<string, string> {
  if (!c || typeof c !== "object" || Array.isArray(c)) return {};
  return c as Record<string, string>;
}

const BloomHero = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const config = cfg(section?.config);
  const heading = section?.title || "Sua pele merece rituais, não rotinas.";
  const sub = section?.subtitle || "Ingredientes puros. Ciência consciente. Beleza real.";
  const cta = section?.cta_text || "Explorar";
  const link = section?.link_url || "/category/skincare";
  const image = section?.image_url || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80";
  const layout = config.layout || "split"; // split | full

  if (layout === "full") {
    return (
      <section ref={ref} data-theme-section="hero" className="relative h-[100svh] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        </motion.div>
        <motion.div style={{ y: textY, opacity }} className="relative z-10 flex flex-col items-center justify-end h-full pb-20 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-display text-4xl md:text-6xl lg:text-7xl text-background max-w-3xl leading-[1.1] mb-6"
          >
            {heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-background/70 text-lg md:text-xl font-light max-w-xl mb-10"
          >
            {sub}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <Link to={link} className="inline-block border border-background/40 text-background px-10 py-4 text-xs tracking-[0.25em] uppercase hover:bg-background hover:text-foreground transition-all duration-500">
              {cta}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section ref={ref} data-theme-section="hero" className="min-h-[100svh] grid grid-cols-1 lg:grid-cols-2">
      {/* Text side */}
      <motion.div
        style={{ y: textY }}
        className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20 lg:py-0 bg-background order-2 lg:order-1"
      >
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[11px] tracking-[0.3em] uppercase text-primary/60 mb-6"
        >
          {sub}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-8"
        >
          {heading}
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <Link to={link} className="inline-flex items-center gap-3 text-foreground text-sm tracking-[0.15em] uppercase group">
            <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors duration-500">
              {cta}
            </span>
            <svg width="20" height="10" viewBox="0 0 20 10" className="group-hover:translate-x-1 transition-transform duration-500">
              <line x1="0" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="0.8" />
              <polyline points="14,1 18,5 14,9" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      {/* Image side */}
      <div className="relative overflow-hidden order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
        <motion.img
          style={{ y: imgY }}
          src={image}
          alt={heading}
          className="absolute inset-0 w-full h-full object-cover scale-105"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </section>
  );
};

export default BloomHero;
