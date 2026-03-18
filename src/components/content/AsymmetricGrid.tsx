import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import earringsCollection from "@/assets/earrings-collection.png";
import linkBracelet from "@/assets/link-bracelet.png";
import organicEarring from "@/assets/organic-earring.png";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface BlockItem {
  image: string;
  alt?: string;
  title: string;
  subtitle: string;
  link: string;
  aspect?: string;
}

const defaultBlocks: BlockItem[] = [
  { image: earringsCollection, alt: "Coleção de brincos", title: "Formas Orgânicas", subtitle: "Brincos", link: "/category/earrings", aspect: "aspect-[4/5]" },
  { image: linkBracelet, alt: "Pulseira de elos", title: "Coleção Correntes", subtitle: "Pulseiras", link: "/category/bracelets", aspect: "aspect-square" },
  { image: organicEarring, alt: "Brinco artesanal", title: "Artesanato", subtitle: "Edição Limitada", link: "/category/rings", aspect: "aspect-[4/3]" },
];

function parseBlocks(config: Json | null | undefined): BlockItem[] | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const c = config as Record<string, Json | undefined>;
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return null;
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "",
    alt: b.alt || b.title || "",
    title: b.title || "",
    subtitle: b.subtitle || "",
    link: b.link || "/",
    aspect: b.aspect,
  }));
}

const AnimatedCard = ({
  image, alt, title, subtitle, link, className, delay = 0, aspect = "aspect-[3/4]",
}: {
  image: string; alt: string; title: string; subtitle: string; link: string;
  className?: string; delay?: number; aspect?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 80 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      <Link to={link} className="group block">
        <div className={`${aspect} overflow-hidden relative`}>
          <img src={image} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.15em]">{subtitle}</p>
          <h3 className="text-display text-lg md:text-xl text-foreground group-hover:opacity-70 transition-opacity duration-300">{title}</h3>
        </div>
      </Link>
    </motion.div>
  );
};

interface Props {
  section?: HomepageSection;
}

const AsymmetricGrid = ({ section }: Props) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-50px" });

  const blocks = parseBlocks(section?.config) || defaultBlocks;
  const sectionTitle = section?.title || "Descubra";
  const sectionSubtitle = section?.subtitle || "Coleções";

  return (
    <section data-theme-section="asymmetric-grid" className="py-20 md:py-32 px-6 md:px-12">
      <motion.div ref={titleRef} initial={{ opacity: 0, y: 30 }} animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }} className="mb-12 md:mb-20">
        <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-2">{sectionSubtitle}</p>
        <h2 className="text-display text-3xl md:text-5xl text-foreground">{sectionTitle}</h2>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {blocks.length >= 1 && (
          <div className="col-span-12 md:col-span-7">
            <AnimatedCard image={blocks[0].image} alt={blocks[0].alt || blocks[0].title} title={blocks[0].title}
              subtitle={blocks[0].subtitle} link={blocks[0].link} aspect={blocks[0].aspect || "aspect-[4/5]"} delay={0} />
          </div>
        )}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-6">
          {blocks.slice(1).map((block, i) => (
            <AnimatedCard key={i} image={block.image} alt={block.alt || block.title} title={block.title}
              subtitle={block.subtitle} link={block.link} aspect={block.aspect || (i === 0 ? "aspect-square" : "aspect-[4/3]")} delay={0.2 + i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AsymmetricGrid;
