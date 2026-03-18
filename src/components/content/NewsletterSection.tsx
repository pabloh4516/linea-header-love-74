import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface Props { section?: HomepageSection; }

const NewsletterSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);
  const [email, setEmail] = useState("");

  const heading = section?.title || "Fique por dentro";
  const description = section?.description || "";
  const buttonText = cfg.button_text || section?.cta_text || "Inscrever";
  const placeholder = cfg.placeholder || "Seu e-mail";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Inscrição realizada com sucesso!");
    setEmail("");
  };

  return (
    <section data-theme-section="newsletter" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl mx-auto text-center"
      >
        <h2 className="text-display text-2xl md:text-3xl text-foreground mb-3">{heading}</h2>
        {description && (
          <p className="text-sm font-light text-muted-foreground mb-8">{description}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-transparent border border-border text-foreground text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            required
          />
          <button
            type="submit"
            className="px-8 py-3 bg-foreground text-background text-editorial text-[11px] tracking-[0.15em] hover:opacity-90 transition-opacity"
          >
            {buttonText}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
