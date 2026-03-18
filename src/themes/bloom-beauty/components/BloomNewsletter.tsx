import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { HomepageSection } from "@/components/content/SectionRenderer";

const BloomNewsletter = ({ section }: { section?: HomepageSection }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");

  const heading = section?.title || "Faça parte do ritual";
  const desc = section?.description || "Receba novidades, dicas de skincare e acesso antecipado a lançamentos.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    toast.success("Bem-vinda ao ritual ✨", { description: "Você receberá nossos e-mails em breve." });
    setEmail("");
  };

  return (
    <section ref={ref} data-theme-section="newsletter" className="py-20 md:py-28 px-6 md:px-12 bg-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-xl mx-auto text-center"
      >
        <h2 className="text-display text-3xl md:text-4xl text-foreground mb-4">{heading}</h2>
        <p className="text-sm font-light text-muted-foreground mb-10">{desc}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 bg-transparent border-b border-foreground/20 focus:border-foreground/60 text-foreground text-sm py-3 px-1 outline-none transition-colors placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            className="text-xs tracking-[0.2em] uppercase text-foreground border border-foreground/30 px-8 py-3 hover:bg-foreground hover:text-background transition-all duration-500"
          >
            Assinar
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default BloomNewsletter;
