import { useProducts } from "@/hooks/useProducts";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import Pagination from "./Pagination";

// Fallback imports
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";

const fallbackProducts = [
  { id: "1", name: "Pantheon", category: "Brincos", price: 2850, image: pantheonImage, isNew: true },
  { id: "2", name: "Eclipse", category: "Pulseiras", price: 3200, image: eclipseImage },
  { id: "3", name: "Halo", category: "Brincos", price: 1950, image: haloImage, isNew: true },
  { id: "4", name: "Oblique", category: "Brincos", price: 1650, image: obliqueImage },
  { id: "5", name: "Lintel", category: "Brincos", price: 2250, image: lintelImage },
  { id: "6", name: "Shadowline", category: "Pulseiras", price: 3950, image: shadowlineImage },
];

export type GridLayout = "standard" | "editorial" | "masonry" | "highlight";

const getAspectRatio = (aspect: string): string => {
  switch (aspect) {
    case "square": return "1/1";
    case "4/5": return "4/5";
    case "2/3": return "2/3";
    case "3/4":
    default: return "3/4";
  }
};

const getHoverClasses = (effect: string) => {
  switch (effect) {
    case "fade": return "group-hover:opacity-80";
    case "slide": return "group-hover:translate-y-[-4px]";
    case "none": return "";
    case "zoom":
    default: return "group-hover:scale-105";
  }
};

interface CardSettings {
  aspect: string;
  hoverEffect: string;
  showCategory: boolean;
  showBadge: boolean;
  badgeStyle: string;
  priceWeight: string;
  nameSize: string;
  gap: string;
}

const ProductCard = ({
  product,
  index,
  aspectOverride,
  showCategory = true,
  className = "",
  cardSettings,
}: {
  product: any;
  index: number;
  aspectOverride?: string;
  showCategory?: boolean;
  className?: string;
  cardSettings: CardSettings;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const aspectRatio = aspectOverride || getAspectRatio(cardSettings.aspect);
  const hoverClass = getHoverClasses(cardSettings.hoverEffect);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="border-none shadow-none bg-transparent group cursor-pointer">
          <CardContent className="p-0">
            <div className="mb-4 overflow-hidden bg-muted/10 relative" style={{ aspectRatio }}>
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${hoverClass} ${product.hoverImage ? "group-hover:opacity-0" : ""}`}
              />
              {product.hoverImage && (
                <img
                  src={product.hoverImage}
                  alt={`${product.name} hover`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 ${hoverClass}`}
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              {cardSettings.showBadge && product.isNew && (
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-editorial text-[9px] tracking-[0.2em] px-2 py-1 ${
                      cardSettings.badgeStyle === "outline"
                        ? "border border-foreground text-foreground"
                        : "text-foreground bg-background/80 backdrop-blur-sm"
                    }`}
                  >
                    NOVO
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              {showCategory && (
                <p className="text-editorial text-[9px] md:text-[10px] text-muted-foreground tracking-[0.15em]">
                  {product.category}
                </p>
              )}
              <div className="flex justify-between items-center">
                <h3
                  className="text-display text-foreground group-hover:opacity-70 transition-opacity duration-300"
                  style={{ fontSize: `${cardSettings.nameSize}px` }}
                >
                  {product.name}
                </h3>
                <p
                  className="text-foreground"
                  style={{ fontWeight: Number(cardSettings.priceWeight), fontSize: `${cardSettings.nameSize}px` }}
                >
                  R${product.price.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const EditorialGrid = ({ products, cardSettings }: { products: any[]; cardSettings: CardSettings }) => {
  const chunks: any[][] = [];
  let i = 0;
  let isLargeRow = true;
  while (i < products.length) {
    if (isLargeRow) { chunks.push(products.slice(i, i + 2)); i += 2; }
    else { chunks.push(products.slice(i, i + 3)); i += 3; }
    isLargeRow = !isLargeRow;
  }
  return (
    <div className="space-y-6 md:space-y-10">
      {chunks.map((chunk, rowIndex) => {
        const isLarge = rowIndex % 2 === 0;
        return (
          <div key={rowIndex} className={isLarge ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8" : "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}>
            {chunk.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={rowIndex * 3 + idx}
                aspectOverride={isLarge ? "4/5" : undefined} cardSettings={cardSettings} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

const MasonryGrid = ({ products, cardSettings, colsDesktop }: { products: any[]; cardSettings: CardSettings; colsDesktop: number }) => {
  const aspects = ["3/4", "1/1", "4/5", "2/3"];
  return (
    <div className={`columns-2 md:columns-3 lg:columns-${colsDesktop} gap-4 md:gap-6 space-y-4 md:space-y-6`}>
      {products.map((product, index) => (
        <div key={product.id} className="break-inside-avoid">
          <ProductCard product={product} index={index} aspectOverride={aspects[index % aspects.length]} cardSettings={cardSettings} />
        </div>
      ))}
    </div>
  );
};

const HighlightGrid = ({ products, cardSettings }: { products: any[]; cardSettings: CardSettings }) => {
  if (products.length === 0) return null;
  const [hero, ...rest] = products;
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        <div className="md:col-span-7">
          <ProductCard product={hero} index={0} aspectOverride="4/5" cardSettings={cardSettings} />
        </div>
        <div className="md:col-span-5 flex flex-col justify-center px-0 md:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="space-y-4">
            <p className="text-editorial text-[10px] tracking-[0.2em] text-muted-foreground">Destaque</p>
            <h2 className="text-display text-3xl md:text-4xl text-foreground">{hero.name}</h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {hero.category} — R${hero.price.toLocaleString('pt-BR')}
            </p>
            <Link to={`/product/${hero.id}`} className="inline-flex items-center gap-2 text-sm font-light text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300 group">
              <span>Ver Produto</span>
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {rest.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index + 1} cardSettings={cardSettings} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductGrid = ({ layout }: { layout?: GridLayout }) => {
  const { category } = useParams();
  const { data: dbProducts, isLoading } = useProducts(category);
  const { theme } = useThemeConfig();

  const effectiveLayout = layout || (theme.categoryLayout as GridLayout) || "standard";

  const cardSettings: CardSettings = {
    aspect: theme.cardAspect,
    hoverEffect: theme.cardHoverEffect,
    showCategory: theme.cardShowCategory,
    showBadge: theme.cardShowBadge,
    badgeStyle: theme.cardBadgeStyle,
    priceWeight: theme.cardPriceWeight,
    nameSize: theme.cardNameSize,
    gap: theme.cardGap,
  };

  const colsDesktop = parseInt(theme.cardColumnsDesktop);
  const colsMobile = parseInt(theme.cardColumnsMobile);

  const products = dbProducts && dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: (p as any).categories?.name || "",
        price: Number(p.price),
        image: p.image_url || "",
        hoverImage: p.hover_image_url || "",
        isNew: p.is_new,
      }))
    : fallbackProducts.map((p) => ({ ...p, hoverImage: "" }));

  if (isLoading) {
    return (
      <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full" style={{ aspectRatio: getAspectRatio(cardSettings.aspect) }} />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 mb-16">
      {effectiveLayout === "editorial" ? (
        <EditorialGrid products={products} cardSettings={cardSettings} />
      ) : effectiveLayout === "masonry" ? (
        <MasonryGrid products={products} cardSettings={cardSettings} colsDesktop={colsDesktop} />
      ) : effectiveLayout === "highlight" ? (
        <HighlightGrid products={products} cardSettings={cardSettings} />
      ) : (
        <div
          className="grid theme-product-grid"
          style={{ gap: `${cardSettings.gap}px`, gridTemplateColumns: `repeat(${colsMobile}, 1fr)` }}
        >
          <style>{`@media (min-width: 768px) { .theme-product-grid { grid-template-columns: repeat(${Math.min(colsDesktop, 3)}, 1fr) !important; } } @media (min-width: 1024px) { .theme-product-grid { grid-template-columns: repeat(${colsDesktop}, 1fr) !important; } }`}</style>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} cardSettings={cardSettings} showCategory={cardSettings.showCategory} />
          ))}
        </div>
      )}
      <Pagination />
    </section>
  );
};

export default ProductGrid;
