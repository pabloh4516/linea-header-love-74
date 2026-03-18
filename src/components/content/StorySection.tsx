import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import founders from "@/assets/founders.png";
import type { HomepageSection } from "./SectionRenderer";

interface Props {
  section?: HomepageSection;
}

const StorySection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const subtitle = section?.subtitle || "Nossa História";
  const title = section?.title || "Joias Nascidas\nde Sombras\ne Linhas";
  const description = section?.description || "A Linea nasceu do encontro de duas mentes que viam beleza não apenas no ornamento, mas na estrutura. Com formações em arquitetura e belas artes, as fundadoras acreditavam que joias poderiam ser uma extensão do espaço, da luz e da linha.";
  const ctaText = section?.cta_text || "Leia Nossa História";
  const linkUrl = section?.link_url || "/about/our-story";
  const image = section?.image_url || founders;

  return (
    <section data-theme-section="story-section" className="py-20 md:py-32 px-6 md:px-12">
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -60 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="md:col-start-1 md:col-span-5 order-2 md:order-1">
          <div className="aspect-[3/4] overflow-hidden">
            <img src={image} alt="Fundadoras da Linea" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-start-7 md:col-span-5 order-1 md:order-2 flex flex-col justify-center">
          <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-4">{subtitle}</p>
          <h2 className="text-display text-2xl md:text-4xl lg:text-5xl text-foreground leading-[1] mb-6 whitespace-pre-line">{title}</h2>
          <p className="text-sm md:text-base font-light text-muted-foreground leading-relaxed mb-8 max-w-md">{description}</p>
          <Link to={linkUrl}
            className="inline-flex items-center gap-3 text-foreground text-sm font-light border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300 group w-fit">
            <span>{ctaText}</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StorySection;
