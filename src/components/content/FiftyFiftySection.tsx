import earringsCollection from "@/assets/earrings-collection.png";
import linkBracelet from "@/assets/link-bracelet.png";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface BlockItem { image: string; title: string; subtitle: string; link: string; }

function parseBlocks(config: Json | null | undefined): BlockItem[] | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const c = config as Record<string, Json | undefined>;
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return null;
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "", title: b.title || "", subtitle: b.subtitle || "", link: b.link || "/",
  }));
}

const defaultBlocks: BlockItem[] = [
  { image: earringsCollection, title: "Formas Orgânicas", subtitle: "Peças inspiradas na natureza com detalhes fluidos e esculturais", link: "/category/earrings" },
  { image: linkBracelet, title: "Coleção Correntes", subtitle: "Elos refinados e conexões em metais preciosos", link: "/category/bracelets" },
];

interface Props { section?: HomepageSection; }

const FiftyFiftySection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const blocks = parseBlocks(section?.config) || defaultBlocks;

  if (section && !parseBlocks(section.config)) {
    if (section.image_url) blocks[0] = { ...blocks[0], image: section.image_url };
    if (section.image_url_2 && blocks[1]) blocks[1] = { ...blocks[1], image: section.image_url_2 };
  }

  return (
    <section data-theme-section="fifty-fifty" className="w-full mb-16 px-6">
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blocks.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={block.link} className="block">
              <div className="w-full aspect-square mb-3 overflow-hidden">
                <img src={block.image} alt={block.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>
            <div>
              <h3 className="text-sm font-normal text-foreground mb-1">{block.title}</h3>
              <p className="text-sm font-light text-foreground">{block.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FiftyFiftySection;
