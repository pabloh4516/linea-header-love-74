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

const ProductCard = ({ product, index }: { product: any; index: number }) => {
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
    >
      <Link to={`/product/${product.id}`}>
        <Card className="border-none shadow-none bg-transparent group cursor-pointer">
          <CardContent className="p-0">
            <div className="aspect-[3/4] mb-4 overflow-hidden bg-muted/10 relative">
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
              <p className="text-editorial text-[9px] md:text-[10px] text-muted-foreground tracking-[0.15em]">
                {product.category}
              </p>
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

const ProductGrid = () => {
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

  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      <Pagination />
    </section>
  );
};

export default ProductGrid;
