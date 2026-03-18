import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "@/components/content/SectionRenderer";

const BloomStory = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const heading = section?.title || "Da terra à pele";
  const desc = section?.description || "Cada ingrediente é escolhido com intenção. Trabalhamos com produtores locais que compartilham nossa filosofia: o que é bom para a terra é bom para a pele.";
  const cta = section?.cta_text || "Nossa história";
  const link = section?.link_url || "/about/our-story";
  const image = section?.image_url || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80";

  return (
    <section ref={ref} data-theme-section="story" className="py-0">
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[80vh]">
        {/* Image - takes 3 cols */}
        <div className="relative overflow-hidden lg:col-span-3 min-h-[50vh]">
          <motion.img
            style={{ y: imgY }}
            src={image}
            alt={heading}
            className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
            loading="lazy"
          />
        </div>

        {/* Text - takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 flex flex-col justify-center px-8 md:px-16 py-16 lg:py-0 bg-background"
        >
          <span className="text-[80px] md:text-[120px] text-foreground/[0.04] font-light leading-none select-none absolute top-8 left-4 pointer-events-none hidden lg:block">
            02
          </span>
          <h2 className="text-display text-3xl md:text-4xl text-foreground leading-[1.2] mb-6">{heading}</h2>
          <p className="text-sm md:text-base font-light text-muted-foreground leading-relaxed mb-8 max-w-md">
            {desc}
          </p>
          <Link
            to={link}
            className="inline-flex items-center gap-3 text-foreground text-xs tracking-[0.2em] uppercase group self-start"
          >
            <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors duration-500">
              {cta}
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BloomStory;
