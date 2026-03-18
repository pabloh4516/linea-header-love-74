import circularCollection from "@/assets/circular-collection.png";
import organicEarring from "@/assets/organic-earring.png";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface BlockItem {
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

function parseBlocks(config: Json | null | undefined): BlockItem[] | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const c = config as Record<string, Json | undefined>;
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return null;
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "", title: b.title || "", subtitle: b.subtitle || "", link: b.link || "/",
  }));
}

const defaultBlocks: BlockItem[] = [
  { image: organicEarring, title: "Artesanato", subtitle: "Peças feitas à mão com atenção meticulosa aos detalhes", link: "/category/rings" },
  { image: circularCollection, title: "Elementos Circulares", subtitle: "Perfeição geométrica encontra minimalismo contemporâneo", link: "/category/necklaces" },
];

interface Props {
  section?: HomepageSection;
}

const OneThirdTwoThirdsSection = ({ section }: Props) => {
  const blocks = parseBlocks(section?.config) || defaultBlocks;

  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {blocks[0] && (
            <>
              <Link to={blocks[0].link} className="block">
                <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
                  <img src={blocks[0].image} alt={blocks[0].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div>
                <h3 className="text-sm font-normal text-foreground mb-1">{blocks[0].title}</h3>
                <p className="text-sm font-light text-foreground">{blocks[0].subtitle}</p>
              </div>
            </>
          )}
        </div>
        <div className="lg:col-span-2">
          {blocks[1] && (
            <>
              <Link to={blocks[1].link} className="block">
                <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
                  <img src={blocks[1].image} alt={blocks[1].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div>
                <h3 className="text-sm font-normal text-foreground mb-1">{blocks[1].title}</h3>
                <p className="text-sm font-light text-foreground">{blocks[1].subtitle}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;
