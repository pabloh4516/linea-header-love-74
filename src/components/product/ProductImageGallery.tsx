import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ImageZoom from "./ImageZoom";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

const productImages = [pantheonImage, organicEarring, eclipseImage, linkBracelet, haloImage];

const ProductImageGallery = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleImageClick = (index: number) => {
    setZoomInitialIndex(index);
    setIsZoomOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="hidden lg:block p-2">
        <div className="grid grid-cols-2 gap-2">
          {productImages.map((image, index) => {
            const DesktopImage = ({ img, idx }: { img: string; idx: number }) => {
              const ref = useRef<HTMLDivElement>(null);
              const isInView = useInView(ref, { once: true, margin: "-80px" });

              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`overflow-hidden cursor-pointer group ${idx === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}
                  onClick={() => handleImageClick(idx)}
                >
                  <img src={img} alt={`Vista do produto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" />
                </motion.div>
              );
            };

            return <DesktopImage key={index} img={image} idx={index} />;
          })}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="relative">
          <div
            className="w-full aspect-[3/4] overflow-hidden cursor-pointer group touch-pan-y bg-muted/20"
            onClick={() => handleImageClick(currentImageIndex)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={productImages[currentImageIndex]}
                alt={`Vista do produto ${currentImageIndex + 1}`}
                className="w-full h-full object-cover select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                loading="eager"
              />
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-4 mb-2 gap-2 px-6">
            {productImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ver imagem ${index + 1}`}
                onClick={() => setCurrentImageIndex(index)}
                className="h-1 flex-1 max-w-8 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: index === currentImageIndex ? "hsl(var(--foreground))" : "hsl(var(--border))",
                }}
              />
            ))}
          </div>

          <div className="absolute top-4 right-4">
            <span className="text-editorial text-[9px] tracking-[0.2em] text-foreground bg-background/70 backdrop-blur-sm px-2 py-1">
              {currentImageIndex + 1} / {productImages.length}
            </span>
          </div>
        </div>
      </div>

      <ImageZoom images={productImages} initialIndex={zoomInitialIndex} isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} />
    </div>
  );
};

export default ProductImageGallery;
