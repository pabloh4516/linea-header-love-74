import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({ images, initialIndex, isOpen, onClose }: ImageZoomProps) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 hover:bg-transparent text-black border-none p-2"
      >
        <X className="h-16 w-16" />
      </Button>

      {/* Scrollable image container */}
      <div className="relative w-full h-full overflow-y-auto">
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center">
              <img
                src={image}
                alt={`Product view ${index + 1}`}
                className="w-full max-w-none object-cover animate-scale-in"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;