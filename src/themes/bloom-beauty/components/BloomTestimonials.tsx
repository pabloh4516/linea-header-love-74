import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import type { HomepageSection } from "@/components/content/SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface Review {
  name: string;
  text: string;
  product: string;
}

function parseReviews(config: Json | null | undefined): Review[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const c = config as Record<string, Json | undefined>;
  const blocks = c.blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.map((b: any) => ({
    name: b?.author || b?.name || "Cliente",
    text: b?.text || b?.content || "",
    product: b?.product || "",
  }));
}

const defaults: Review[] = [
  { name: "Camila R.", text: "O sérum mudou minha rotina. Minha pele nunca esteve tão hidratada e luminosa. Uso há 3 meses e a diferença é visível.", product: "Sérum Hidratante" },
  { name: "Juliana M.", text: "Finalmente encontrei produtos que fazem o que prometem. A textura é leve, absorve rápido e o resultado é imediato.", product: "Creme Noturno" },
  { name: "Beatriz S.", text: "Amo a proposta da marca — ingredientes puros, sem exagero de embalagem. Minha pele sensível agradece.", product: "Óleo Facial" },
];

const BloomTestimonials = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const heading = section?.title || "Quem usa, sente";
  const reviews = parseReviews(section?.config);
  const items = reviews.length > 0 ? reviews : defaults;

  return (
    <section ref={ref} data-theme-section="testimonials" className="py-20 md:py-28 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-display text-3xl md:text-4xl text-foreground mb-16">{heading}</h2>

        <div className="relative min-h-[200px]">
          {items.map((review, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : 10 }}
              transition={{ duration: 0.5 }}
              className={`${i === active ? "" : "absolute inset-0 pointer-events-none"}`}
            >
              <p className="text-lg md:text-2xl font-light text-foreground/80 leading-relaxed italic mb-8">
                "{review.text}"
              </p>
              <div className="space-y-1">
                <p className="text-sm tracking-[0.15em] uppercase text-foreground">{review.name}</p>
                {review.product && (
                  <p className="text-xs text-muted-foreground font-light">{review.product}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-8 h-[2px] transition-all duration-300 ${
                  i === active ? "bg-foreground" : "bg-foreground/20"
                }`}
                aria-label={`Depoimento ${i + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default BloomTestimonials;
