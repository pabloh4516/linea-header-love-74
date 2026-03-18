import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { HomepageSection } from "@/components/content/SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

interface Ingredient {
  number: string;
  title: string;
  description: string;
  image?: string;
}

function parseIngredients(config: Json | null | undefined): Ingredient[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const c = config as Record<string, Json | undefined>;
  const blocks = c.blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.map((b: any, i: number) => ({
    number: String(i + 1).padStart(2, "0"),
    title: b?.title || `Ingrediente ${i + 1}`,
    description: b?.description || "",
    image: b?.image || "",
  }));
}

const defaults: Ingredient[] = [
  { number: "01", title: "Ácido Hialurônico", description: "Hidratação profunda que preenche e suaviza, mantendo a pele luminosa por horas." },
  { number: "02", title: "Niacinamida", description: "Uniformiza o tom, minimiza poros e fortalece a barreira cutânea." },
  { number: "03", title: "Esqualano Vegetal", description: "Emoliente natural que sela a hidratação sem obstruir os poros." },
  { number: "04", title: "Vitamina C Estabilizada", description: "Antioxidante que ilumina e protege contra danos ambientais." },
];

const BloomIngredients = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const heading = section?.title || "Ingredientes com propósito";
  const subtitle = section?.subtitle || "Cada fórmula é um ritual consciente";
  const items = parseIngredients(section?.config);
  const ingredients = items.length > 0 ? items : defaults;

  return (
    <section ref={ref} data-theme-section="multicolumn" className="py-20 md:py-28 px-6 md:px-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">{subtitle}</span>
        <h2 className="text-display text-3xl md:text-5xl text-foreground">{heading}</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 max-w-6xl mx-auto">
        {ingredients.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-background p-8 md:p-10 flex flex-col"
          >
            <span className="text-display text-5xl md:text-6xl text-foreground/[0.06] mb-4 select-none">
              {item.number}
            </span>
            {item.image && (
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-muted/50">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-sm tracking-[0.1em] uppercase text-foreground mb-3">{item.title}</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BloomIngredients;
