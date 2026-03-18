import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import circularCollection from "@/assets/circular-collection.png";
import { Link } from "react-router-dom";
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

interface Props {
  section?: HomepageSection;
}

const FullWidthBanner = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const image = section?.image_url || circularCollection;
  const subtitle = section?.subtitle || "Exclusivo";
  const title = section?.title || "Elementos\nCirculares";
  const description = section?.description || "Perfeição geométrica encontra minimalismo contemporâneo em peças que transcendem o tempo.";
  const ctaText = section?.cta_text || "Ver Coleção";
  const linkUrl = section?.link_url || "/category/necklaces";
  const buttons = parseButtons(section?.config);

  return (
    <section data-theme-section="full-width-banner" ref={ref} className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden my-8 md:my-16">
      <motion.div style={{ y }} className="absolute inset-0 -top-[15%] h-[130%]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      </motion.div>

      <div className="relative h-full flex items-center px-6 md:px-12">
        <motion.div ref={textRef} initial={{ opacity: 0, x: -40 }} animate={isTextInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-lg">
          <p className="text-editorial text-[10px] md:text-xs text-white/70 tracking-[0.2em] mb-3">{subtitle}</p>
          <h2 className="text-display text-3xl md:text-5xl lg:text-6xl text-white leading-[0.95] mb-4 whitespace-pre-line">{title}</h2>
          <p className="text-white/70 text-sm md:text-base font-light leading-relaxed mb-6 max-w-sm">{description}</p>
          <div className="flex flex-wrap items-center gap-4">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FullWidthBanner;
