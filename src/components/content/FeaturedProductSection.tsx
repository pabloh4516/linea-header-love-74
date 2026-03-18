import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props { section?: HomepageSection; }

const FeaturedProductSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const sectionTitle = section?.title || "";
  const subtitle = section?.subtitle || "";
  const productName = cfg.product_name || section?.title || "Produto em Destaque";
  const description = section?.description || cfg.description || "";
  const price = cfg.price || "";
  const ctaText = section?.cta_text || cfg.cta_text || "Comprar Agora";
  const linkUrl = section?.link_url || cfg.link_url || "#";
  const image = section?.image_url || cfg.image_url || "";
  const imagePosition = cfg.image_position || "left";
  const showPrice = cfg.show_price !== "false";
  const showDescription = cfg.show_description !== "false";

  return (
    <section data-theme-section="featured-product" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {(sectionTitle || subtitle) && (
          <div className="text-center mb-12">
            {sectionTitle && <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{sectionTitle}</h2>}
            {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto ${imagePosition === "right" ? "" : ""}`}>
          <motion.div
            className={imagePosition === "right" ? "order-2" : "order-1"}
            initial={{ opacity: 0, x: imagePosition === "right" ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {image ? (
              <div className="aspect-[3/4] overflow-hidden bg-muted/10">
                <img src={image} alt={productName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-muted/10 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Imagem do produto</span>
              </div>
            )}
          </motion.div>
          <motion.div
            className={`space-y-6 ${imagePosition === "right" ? "order-1" : "order-2"}`}
            initial={{ opacity: 0, x: imagePosition === "right" ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-display text-2xl md:text-3xl text-foreground">{productName}</h3>
            {showPrice && price && (
              <p className="text-lg font-light text-foreground">{price}</p>
            )}
            {showDescription && description && (
              <p className="text-sm font-light text-muted-foreground leading-relaxed">{description}</p>
            )}
            <Link
              to={linkUrl}
              className="inline-flex items-center px-8 py-3 bg-foreground text-background text-sm tracking-wider hover:opacity-90 transition-opacity"
            >
              {ctaText}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturedProductSection;
