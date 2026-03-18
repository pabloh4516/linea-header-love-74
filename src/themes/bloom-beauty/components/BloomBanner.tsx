import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "@/components/content/SectionRenderer";

const BloomBanner = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const heading = section?.title || "Menos é mais.";
  const desc = section?.description || "Fórmulas essenciais que respeitam sua pele.";
  const cta = section?.cta_text || "Conheça";
  const link = section?.link_url || "/category/essentials";
  const image = section?.image_url || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&q=80";

  return (
    <section ref={ref} data-theme-section="full_width_banner" className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <motion.img
        style={{ y: imgY }}
        src={image}
        alt={heading}
        className="absolute inset-0 w-full h-full object-cover scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-foreground/30" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <h2 className="text-display text-4xl md:text-6xl text-background mb-4">{heading}</h2>
        <p className="text-background/70 font-light text-base md:text-lg max-w-lg mb-8">{desc}</p>
        {cta && (
          <Link
            to={link}
            className="border border-background/40 text-background px-10 py-3.5 text-xs tracking-[0.25em] uppercase hover:bg-background hover:text-foreground transition-all duration-500"
          >
            {cta}
          </Link>
        )}
      </motion.div>
    </section>
  );
};

export default BloomBanner;
