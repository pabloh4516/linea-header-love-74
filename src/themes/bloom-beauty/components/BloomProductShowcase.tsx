import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import type { HomepageSection } from "@/components/content/SectionRenderer";

const BloomProductShowcase = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { data: dbProducts, isLoading } = useProducts();

  const title = section?.title || "Rituais";
  const subtitle = section?.subtitle || "Produtos pensados para cada etapa do seu cuidado";
  const cta = section?.cta_text || "Ver todos";
  const link = section?.link_url || "/category/all";

  const products = (dbProducts || [])
    .filter((p) => p.image_url && p.is_visible)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url!,
      category: p.material || "Skincare",
    }));

  if (isLoading) {
    return (
      <section className="py-20 px-6">
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[280px]">
              <div className="aspect-[3/4] bg-muted animate-pulse rounded-sm" />
              <div className="h-3 bg-muted animate-pulse mt-4 w-3/4" />
              <div className="h-3 bg-muted animate-pulse mt-2 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} data-theme-section="product_carousel" className="py-20 md:py-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between px-6 md:px-12 mb-12"
      >
        <div>
          <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">{subtitle}</span>
          <h2 className="text-display text-3xl md:text-5xl text-foreground">{title}</h2>
        </div>
        <Link
          to={link}
          className="mt-4 md:mt-0 text-xs tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground border-b border-foreground/20 hover:border-foreground/60 pb-1 transition-all duration-400 self-start md:self-auto"
        >
          {cta}
        </Link>
      </motion.div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide px-6 md:px-12">
        <div className="flex gap-5 md:gap-8 w-max">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="shrink-0 w-[240px] md:w-[300px] group"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/30 mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Numbered label */}
                  <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] text-foreground/40 font-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-1">{product.category}</p>
                <p className="text-sm text-foreground font-light">{product.name}</p>
                <p className="text-sm text-foreground/70 mt-1">
                  R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BloomProductShowcase;
