import { useProducts } from "@/hooks/useProducts";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";

const fallbackProducts = [
  { id: "1", name: "Pantheon", category: "Brincos", price: 2850, image: pantheonImage },
  { id: "2", name: "Eclipse", category: "Pulseiras", price: 3200, image: eclipseImage },
  { id: "3", name: "Halo", category: "Brincos", price: 1950, image: haloImage, isNew: true },
  { id: "4", name: "Oblique", category: "Brincos", price: 1650, image: obliqueImage },
  { id: "5", name: "Lintel", category: "Brincos", price: 2250, image: lintelImage },
  { id: "6", name: "Shadowline", category: "Pulseiras", price: 3950, image: shadowlineImage },
];

interface ProductCarouselProps {
  showHeader?: boolean;
}

const ProductCarousel = ({ showHeader = true }: ProductCarouselProps) => {
  const { data: dbProducts, isLoading } = useProducts();
  const titleRef = useRef<HTMLDivElement>(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-50px" });

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
    : fallbackProducts.map((p) => ({
        ...p,
        hoverImage: "",
        isNew: p.id === "3",
      }));

  const sectionClassName = showHeader ? "w-full py-16 md:py-24 px-6 md:px-12" : "w-full py-2 px-6 md:px-12";

  if (isLoading) {
    return (
      <section className={sectionClassName}>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="basis-1/4 space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClassName}>
      {showHeader && (
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-10 md:mb-14"
        >
          <div>
            <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-2">
              Seleção
            </p>
            <h2 className="text-display text-3xl md:text-5xl text-foreground">
              Destaques
            </h2>
          </div>
          <Link
            to="/category/shop"
            className="hidden md:inline-flex items-center gap-2 text-foreground text-sm font-light border-b border-foreground/30 pb-1 hover:border-foreground transition-colors duration-300 group"
          >
            <span>Ver Tudo</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      )}

      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-3 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="pl-3 md:pl-4 basis-[70%] md:basis-1/3 lg:basis-1/4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={`/product/${product.id}`}>
                  <Card className="border-none shadow-none bg-transparent group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] mb-4 overflow-hidden relative bg-muted/20">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.hoverImage && (
                          <img
                            src={product.hoverImage}
                            alt={`${product.name} hover`}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                        {product.isNew && (
                          <div className="absolute top-3 left-3">
                            <span className="text-editorial text-[10px] tracking-[0.15em] bg-foreground text-background px-3 py-1">
                              NOVO
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-editorial text-[10px] text-muted-foreground tracking-[0.12em]">
                          {product.category}
                        </p>
                        <div className="flex justify-between items-center gap-4">
                          <h3 className="text-sm font-medium text-foreground group-hover:opacity-70 transition-opacity duration-300">
                            {product.name}
                          </h3>
                          <p className="text-sm font-light text-foreground whitespace-nowrap">
                            R${product.price.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {showHeader && (
        <div className="mt-8 md:hidden">
          <Link
            to="/category/shop"
            className="inline-flex items-center gap-2 text-foreground text-sm font-light border-b border-foreground/30 pb-1"
          >
            <span>Ver Tudo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProductCarousel;
