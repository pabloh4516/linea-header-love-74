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

const ContactFormSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "Fale Conosco";
  const description = section?.description || "";
  const buttonText = cfg.button_text || section?.cta_text || "Enviar";
  const successMessage = cfg.success_message || "Mensagem enviada com sucesso!";

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(successMessage);
    setForm({ name: "", email: "", message: "" });
  };

  const inputClass = "w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors";

  return (
    <section data-theme-section="contact-form" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-10">
          <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>
          {description && <p className="text-sm font-light text-muted-foreground whitespace-pre-line">{description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Nome" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="email" placeholder="E-mail" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="Mensagem" required rows={5} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`${inputClass} resize-none`}
          />
          <button
            type="submit"
            className="w-full py-3 bg-foreground text-background text-editorial text-[11px] tracking-[0.15em] hover:opacity-90 transition-opacity"
          >
            {buttonText}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default ContactFormSection;
