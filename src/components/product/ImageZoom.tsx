import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({ images, initialIndex, isOpen, onClose }: ImageZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const imageElement = scrollRef.current.children[0]?.children[initialIndex] as HTMLElement;
      if (imageElement) {
        imageElement.scrollIntoView({ block: "start" });
      }
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 hover:bg-background/10 text-background border-none p-2"
        aria-label="Fechar zoom"
      >
        <X className="h-7 w-7" />
      </Button>

      <div ref={scrollRef} className="relative w-full h-full overflow-y-auto">
        <div className="space-y-4 py-16">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center px-4">
              <img src={image} alt={`Vista ampliada do produto ${index + 1}`} className="w-full max-w-5xl object-cover animate-scale-in" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;
