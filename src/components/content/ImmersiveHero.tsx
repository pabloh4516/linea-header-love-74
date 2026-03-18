import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface ButtonBlock {
  text: string;
  link: string;
  style?: "primary" | "outline" | "text";
}

function parseButtons(config: Json | null | undefined): ButtonBlock[] | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const c = config as Record<string, Json | undefined>;
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return null;
  return (c.blocks as Record<string, string>[]).map((b) => ({
    text: b.text || "",
    link: b.link || "#",
    style: (b.style as ButtonBlock["style"]) || "primary",
  }));
}

interface Props {
  section?: HomepageSection;
}

const CTAButton = ({ btn }: { btn: ButtonBlock }) => {
  const base = "inline-flex items-center gap-3 text-sm font-light transition-colors duration-300 group";
  const styles: Record<string, string> = {
    primary: `${base} text-white border-b border-white/50 pb-1 hover:border-white`,
    outline: `${base} text-white border border-white/50 px-6 py-3 hover:bg-white/10`,
    text: `${base} text-white/80 hover:text-white`,
  };

  return (
    <Link to={btn.link} className={styles[btn.style || "primary"]}>
      <span>{btn.text}</span>
      {btn.style !== "text" && (
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      )}
    </Link>
  );
};

const ImmersiveHero = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const subtitle = section?.subtitle || "Nova Coleção 2026";
  const title = section?.title || "Herança\nModerna";
  const ctaText = section?.cta_text || "Explorar Coleção";
  const linkUrl = section?.link_url || "/category/shop";
  const image = section?.image_url || heroImage;
  const buttons = parseButtons(section?.config);

  return (
    <section data-theme-section="hero" ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={image} alt="Coleção Linea" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative h-full flex flex-col justify-end px-6 md:px-12 pb-16 md:pb-24">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="text-editorial text-white/80 text-xs md:text-sm mb-3 tracking-[0.2em]">
          {subtitle}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="text-display text-white text-4xl md:text-6xl lg:text-8xl leading-[0.9] max-w-4xl mb-6 whitespace-pre-line">
          {title}
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4">
          {buttons ? (
            buttons.map((btn, i) => <CTAButton key={i} btn={btn} />)
          ) : (
            <Link to={linkUrl}
              className="inline-flex items-center gap-3 text-white text-sm font-light border-b border-white/50 pb-1 hover:border-white transition-colors duration-300 group">
              <span>{ctaText}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/60" />
      </motion.div>
    </section>
  );
};

export default ImmersiveHero;
