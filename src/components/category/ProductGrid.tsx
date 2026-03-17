import { useProducts } from "@/hooks/useProducts";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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

// Animated product card
const ProductCard = ({
  product,
  index,
  aspect = "aspect-[3/4]",
  showCategory = true,
  className = "",
}: {
  product: any;
  index: number;
  aspect?: string;
  showCategory?: boolean;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: (index % 4) * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="border-none shadow-none bg-transparent group cursor-pointer">
          <CardContent className="p-0">
            <div className={`${aspect} mb-4 overflow-hidden bg-muted/10 relative`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
              />
              {product.hoverImage && (
                <img
                  src={product.hoverImage}
                  alt={`${product.name} hover`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              {product.isNew && (
                <div className="absolute top-3 left-3">
                  <span className="text-editorial text-[9px] tracking-[0.2em] text-foreground bg-background/80 backdrop-blur-sm px-2 py-1">
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
                <h3 className="text-display text-sm md:text-base text-foreground group-hover:opacity-70 transition-opacity duration-300">
                  {product.name}
                </h3>
                <p className="text-sm font-light text-foreground">
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

// ── Layout: Standard (4-column uniform grid) ──
const StandardGrid = ({ products }: { products: any[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
    {products.map((product, index) => (
      <ProductCard key={product.id} product={product} index={index} />
    ))}
  </div>
);

// ── Layout: Editorial (mixed large/small rows) ──
const EditorialGrid = ({ products }: { products: any[] }) => {
  const chunks: any[][] = [];
  let i = 0;
  let isLargeRow = true;

  while (i < products.length) {
    if (isLargeRow) {
      chunks.push(products.slice(i, i + 2));
      i += 2;
    } else {
      chunks.push(products.slice(i, i + 3));
      i += 3;
    }
    isLargeRow = !isLargeRow;
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {chunks.map((chunk, rowIndex) => {
        const isLarge = rowIndex % 2 === 0;
        return (
          <div
            key={rowIndex}
            className={
              isLarge
                ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
                : "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            }
          >
            {chunk.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={rowIndex * 3 + idx}
                aspect={isLarge ? "aspect-[4/5]" : "aspect-[3/4]"}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ── Layout: Masonry (varied heights, Pinterest style) ──
const MasonryGrid = ({ products }: { products: any[] }) => {
  const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]"];

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
      {products.map((product, index) => (
        <div key={product.id} className="break-inside-avoid">
          <ProductCard
            product={product}
            index={index}
            aspect={aspects[index % aspects.length]}
          />
        </div>
      ))}
    </div>
  );
};

// ── Layout: Highlight (first product hero, rest in grid) ──
const HighlightGrid = ({ products }: { products: any[] }) => {
  if (products.length === 0) return null;

  const [hero, ...rest] = products;

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero product */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        <div className="md:col-span-7">
          <ProductCard
            product={hero}
            index={0}
            aspect="aspect-[4/5]"
          />
        </div>
        <div className="md:col-span-5 flex flex-col justify-center px-0 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-4"
          >
            <p className="text-editorial text-[10px] tracking-[0.2em] text-muted-foreground">
              Destaque
            </p>
            <h2 className="text-display text-3xl md:text-4xl text-foreground">
              {hero.name}
            </h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {hero.category} — R${hero.price.toLocaleString('pt-BR')}
            </p>
            <Link
              to={`/product/${hero.id}`}
              className="inline-flex items-center gap-2 text-sm font-light text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300 group"
            >
              <span>Ver Produto</span>
              <svg
                className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Rest in standard grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {rest.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main ProductGrid ──
const ProductGrid = ({ layout = "standard" }: { layout?: GridLayout }) => {
  const { category } = useParams();
  const { data: dbProducts, isLoading } = useProducts(category);

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
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const GridComponent = {
    standard: StandardGrid,
    editorial: EditorialGrid,
    masonry: MasonryGrid,
    highlight: HighlightGrid,
  }[layout] || StandardGrid;

  return (
    <section className="w-full px-6 mb-16">
      <GridComponent products={products} />
      <Pagination />
    </section>
  );
};

export default ProductGrid;
