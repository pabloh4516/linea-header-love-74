import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import earringsCollection from "@/assets/earrings-collection.png";
import linkBracelet from "@/assets/link-bracelet.png";
import organicEarring from "@/assets/organic-earring.png";

const AnimatedCard = ({
  image,
  alt,
  title,
  subtitle,
  link,
  className,
  delay = 0,
  aspect = "aspect-[3/4]",
}: {
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  link: string;
  className?: string;
  delay?: number;
  aspect?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Link to={link} className="group block">
        <div className={`${aspect} overflow-hidden relative`}>
          <img
            src={image}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.15em]">
            {subtitle}
          </p>
          <h3 className="text-display text-lg md:text-xl text-foreground group-hover:opacity-70 transition-opacity duration-300">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

const AsymmetricGrid = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-50px" });

  return (
    <section data-theme-section="asymmetric-grid" className="py-20 md:py-32 px-6 md:px-12">
      {/* Section title */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-12 md:mb-20"
      >
        <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-2">
          Coleções
        </p>
        <h2 className="text-display text-3xl md:text-5xl text-foreground">
          Descubra
        </h2>
      </motion.div>

      {/* Asymmetric grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Large card - spans 7 cols */}
        <div className="col-span-12 md:col-span-7">
          <AnimatedCard
            image={earringsCollection}
            alt="Coleção de brincos"
            title="Formas Orgânicas"
            subtitle="Brincos"
            link="/category/earrings"
            aspect="aspect-[4/5]"
            delay={0}
          />
        </div>

        {/* Right column - 2 stacked cards spanning 5 cols */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-6">
          <AnimatedCard
            image={linkBracelet}
            alt="Pulseira de elos"
            title="Coleção Correntes"
            subtitle="Pulseiras"
            link="/category/bracelets"
            aspect="aspect-square"
            delay={0.2}
          />
          <AnimatedCard
            image={organicEarring}
            alt="Brinco artesanal"
            title="Artesanato"
            subtitle="Edição Limitada"
            link="/category/rings"
            aspect="aspect-[4/3]"
            delay={0.35}
          />
        </div>
      </div>
    </section>
  );
};

export default AsymmetricGrid;
