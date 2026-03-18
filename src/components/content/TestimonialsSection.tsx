import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface Testimonial {
  author: string;
  quote: string;
  rating: number;
  location: string;
}

function parseTestimonials(config: Json | null | undefined): Testimonial[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const c = config as Record<string, Json | undefined>;
  if (!Array.isArray(c.blocks) || c.blocks.length === 0) {
    return [
      { author: "Maria S.", quote: "Peças incríveis, qualidade impecável. Uso diariamente.", rating: 5, location: "São Paulo" },
      { author: "Ana L.", quote: "Design minimalista que combina com tudo. Apaixonada!", rating: 5, location: "Rio de Janeiro" },
      { author: "Carla M.", quote: "Presenteei minha mãe e ela amou. Embalagem linda.", rating: 4, location: "Curitiba" },
    ];
  }
  return (c.blocks as Record<string, string>[]).map((b) => ({
    author: b.author || "",
    quote: b.quote || "",
    rating: parseInt(b.rating || "5"),
    location: b.location || "",
  }));
}

interface Props { section?: HomepageSection; }

const TestimonialsSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const heading = section?.title || "O que dizem nossos clientes";
  const subtitle = section?.subtitle || "";
  const testimonials = parseTestimonials(section?.config);

  return (
    <section data-theme-section="testimonials" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-12">
          <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>
          {subtitle && <p className="text-sm font-light text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="border border-border p-8 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s < t.rating ? "fill-foreground text-foreground" : "text-border"}`} />
                ))}
              </div>
              <p className="text-sm font-light text-muted-foreground italic leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-medium text-foreground">{t.author}</p>
                {t.location && <p className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground mt-1">{t.location}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
