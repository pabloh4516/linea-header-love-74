import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface GalleryImage {
  image: string;
  caption: string;
  link: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseImages(config: Json | null | undefined): GalleryImage[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) return [];
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || "",
    caption: b.caption || "",
    link: b.link || "",
  }));
}

interface Props { section?: HomepageSection; }

const ImageGallerySection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const cfg = getConfig(section?.config);

  const heading = section?.title || "";
  const layout = String(cfg.layout || "grid");
  const columns = parseInt(String(cfg.columns || "3"));
  const images = parseImages(section?.config);

  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  const isMasonry = layout === "masonry";
  const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]"];

  return (
    <section data-theme-section="image-gallery" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {heading && <h2 className="text-display text-2xl md:text-4xl text-foreground mb-10 text-center">{heading}</h2>}

        {isMasonry ? (
          <div className={`columns-2 md:columns-${columns} gap-4 space-y-4`}>
            {images.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: i * 0.1 }}
                className="break-inside-avoid cursor-pointer" onClick={() => setLightbox(i)}>
                <div className={aspects[i % aspects.length] + " overflow-hidden bg-muted/10"}>
                  <img src={img.image} alt={img.caption} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                {img.caption && <p className="text-xs font-light text-muted-foreground mt-2">{img.caption}</p>}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-2 ${colClass} gap-4`}>
            {images.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="cursor-pointer group" onClick={() => setLightbox(i)}>
                <div className="aspect-square overflow-hidden bg-muted/10">
                  <img src={img.image} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                {img.caption && <p className="text-xs font-light text-muted-foreground mt-2">{img.caption}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <img src={images[lightbox].image} alt={images[lightbox].caption} className="max-w-full max-h-[85vh] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImageGallerySection;
