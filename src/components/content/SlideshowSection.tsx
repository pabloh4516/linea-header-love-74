import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";
import heroImage from "@/assets/hero-image.png";

interface Slide {
  image: string;
  heading: string;
  subheading: string;
  button_text: string;
  button_link: string;
  text_position: string;
}

function getConfig(config: Json | null | undefined): Record<string, Json | undefined> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, Json | undefined>;
}

function parseSlides(config: Json | null | undefined): Slide[] {
  const c = getConfig(config);
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) {
    return [
      { image: heroImage, heading: "Slide 1", subheading: "Subtítulo", button_text: "Ver Mais", button_link: "#", text_position: "center" },
    ];
  }
  return (c.blocks as Record<string, string>[]).map((b) => ({
    image: b.image || heroImage,
    heading: b.heading || "",
    subheading: b.subheading || "",
    button_text: b.button_text || "",
    button_link: b.button_link || "#",
    text_position: b.text_position || "center",
  }));
}

interface Props { section?: HomepageSection; }

const SlideshowSection = ({ section }: Props) => {
  const cfg = getConfig(section?.config);
  const autoplaySpeed = parseInt(String(cfg.autoplay_speed || "5")) * 1000;
  const showArrows = cfg.show_arrows !== "false";
  const showDots = cfg.show_dots !== "false";
  const height = String(cfg.height || "large");

  const slides = parseSlides(section?.config);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, autoplaySpeed);
    return () => clearInterval(timer);
  }, [next, autoplaySpeed, slides.length]);

  const heightClass = height === "full" ? "h-screen" : height === "medium" ? "h-[60vh]" : "h-[80vh]";

  const positionClass = (pos: string) => {
    if (pos === "left") return "items-start text-left pl-6 md:pl-16";
    if (pos === "right") return "items-end text-right pr-6 md:pr-16";
    return "items-center text-center";
  };

  return (
    <section data-theme-section="slideshow" className={`relative w-full ${heightClass} overflow-hidden`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img src={slides[current].image} alt={slides[current].heading} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className={`relative h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-12 ${positionClass(slides[current].text_position)}`}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            {slides[current].subheading && (
              <p className="text-editorial text-white/80 text-xs tracking-[0.2em] mb-3">{slides[current].subheading}</p>
            )}
            {slides[current].heading && (
              <h2 className="text-display text-white text-3xl md:text-6xl leading-[0.9] mb-6 max-w-3xl">{slides[current].heading}</h2>
            )}
            {slides[current].button_text && (
              <Link to={slides[current].button_link}
                className="inline-flex items-center gap-3 text-white text-sm font-light border-b border-white/50 pb-1 hover:border-white transition-colors duration-300">
                <span>{slides[current].button_text}</span>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-white w-6" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SlideshowSection;
