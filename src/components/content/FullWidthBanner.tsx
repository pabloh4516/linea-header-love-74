import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import circularCollection from "@/assets/circular-collection.png";
import { Link } from "react-router-dom";

const FullWidthBanner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section data-theme-section="full-width-banner" ref={ref} className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden my-8 md:my-16">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-0 -top-[15%] h-[130%]">
        <img
          src={circularCollection}
          alt="Coleção circular"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      </motion.div>

      {/* Content overlay */}
      <div className="relative h-full flex items-center px-6 md:px-12">
        <motion.div
          ref={textRef}
          initial={{ opacity: 0, x: -40 }}
          animate={isTextInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg"
        >
          <p className="text-editorial text-[10px] md:text-xs text-white/70 tracking-[0.2em] mb-3">
            Exclusivo
          </p>
          <h2 className="text-display text-3xl md:text-5xl lg:text-6xl text-white leading-[0.95] mb-4">
            Elementos
            <br />
            Circulares
          </h2>
          <p className="text-white/70 text-sm md:text-base font-light leading-relaxed mb-6 max-w-sm">
            Perfeição geométrica encontra minimalismo contemporâneo em peças que transcendem o tempo.
          </p>
          <Link
            to="/category/necklaces"
            className="inline-flex items-center gap-3 text-white text-sm font-light border-b border-white/50 pb-1 hover:border-white transition-colors duration-300 group"
          >
            <span>Ver Coleção</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FullWidthBanner;
