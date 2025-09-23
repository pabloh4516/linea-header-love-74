import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Pantheon",
    category: "Earrings",
    price: "€285",
    image: pantheonImage,
  },
  {
    id: 2,
    name: "Eclipse",
    category: "Bracelets",
    price: "€320",
    image: eclipseImage,
  },
  {
    id: 3,
    name: "Halo",
    category: "Earrings",
    price: "€195",
    image: haloImage,
  },
  {
    id: 4,
    name: "Oblique",
    category: "Earrings",
    price: "€165",
    image: obliqueImage,
  },
  {
    id: 5,
    name: "Lintel",
    category: "Earrings",
    price: "€225",
    image: lintelImage,
  },
  {
    id: 6,
    name: "Shadowline",
    category: "Bracelets",
    price: "€395",
    image: shadowlineImage,
  },
];

const ProductCarousel = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-foreground mb-1">
            Featured Collection
          </h2>
          <p className="text-sm font-light text-foreground">
            Discover our signature pieces crafted with precision and care
          </p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-light text-muted-foreground uppercase tracking-wide">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium text-foreground">
                        {product.price}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default ProductCarousel;