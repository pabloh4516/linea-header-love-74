import { useProducts } from "@/hooks/useProducts";
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

const ProductCarousel = () => {
  const { data: dbProducts, isLoading } = useProducts();

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

  if (isLoading) {
    return (
      <section className="w-full mb-16 px-6">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="basis-1/4 space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mb-16 px-6">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4">
              <Link to={`/product/${product.id}`}>
                <Card className="border-none shadow-none bg-transparent group">
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-0"
                      />
                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/[0.03]" />
                      {product.isNew && (
                        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-foreground">NOVO</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light text-foreground">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
                        <p className="text-sm font-light text-foreground">R${product.price.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;
