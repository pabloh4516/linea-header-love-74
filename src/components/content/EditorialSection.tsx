import founders from "@/assets/founders.png";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props {
  section?: HomepageSection;
}

const EditorialSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const title = section?.title || "Joias Nascidas de Sombras e Linhas";
  const description = section?.description || "A Linea nasceu do encontro de duas mentes que viam beleza não apenas no ornamento, mas na estrutura. Com formações em arquitetura e belas artes, as fundadoras acreditavam que joias poderiam ser mais do que decoração — poderiam ser uma extensão do espaço, da luz e da linha.";
  const ctaText = section?.cta_text || "Leia nossa história completa";
  const linkUrl = section?.link_url || "/about/our-story";
  const image = section?.image_url || founders;
  const imagePosition = cfg.image_position || "right";

  return (
    <section data-theme-section="editorial" className="w-full mb-16 px-6">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        <motion.div
          className={`space-y-4 max-w-[630px] ${imagePosition === "left" ? "order-last" : ""}`}
          initial={{ opacity: 0, x: imagePosition === "left" ? 20 : -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-2xl font-normal text-foreground leading-tight md:text-xl">{title}</h2>
          <p className="text-sm font-light text-foreground leading-relaxed">{description}</p>
          <Link to={linkUrl} className="inline-flex items-center gap-1 text-sm font-light text-foreground hover:text-foreground/80 transition-colors duration-200">
            <span>{ctaText}</span>
            <ArrowRight size={12} />
          </Link>
        </motion.div>
        <motion.div
          className={imagePosition === "left" ? "order-first" : "order-first md:order-last"}
          initial={{ opacity: 0, x: imagePosition === "left" ? -20 : 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="w-full aspect-square overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default EditorialSection;
