import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface Props { section?: HomepageSection; }

const CountdownSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cfg = getConfig(section?.config);

  const heading = section?.title || "Em Breve";
  const subtitle = section?.subtitle || "";
  const endDate = cfg.end_date || "";
  const ctaText = section?.cta_text || cfg.cta_text || "";
  const linkUrl = section?.link_url || cfg.link_url || "#";
  const expiredMessage = cfg.expired_message || "Evento encerrado";
  const showDays = cfg.show_days !== "false";
  const showHours = cfg.show_hours !== "false";
  const showMinutes = cfg.show_minutes !== "false";
  const showSeconds = cfg.show_seconds !== "false";
  const image = section?.image_url || cfg.image_url || "";

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => endDate ? calculateTimeLeft(endDate) : null);

  useEffect(() => {
    if (!endDate) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const units: Array<{ key: keyof TimeLeft; label: string; show: boolean }> = [
    { key: "days", label: "Dias", show: showDays },
    { key: "hours", label: "Horas", show: showHours },
    { key: "minutes", label: "Min", show: showMinutes },
    { key: "seconds", label: "Seg", show: showSeconds },
  ];

  return (
    <section
      data-theme-section="countdown"
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
    >
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
      )}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative text-center max-w-3xl mx-auto ${image ? "text-background" : ""}`}
      >
        <h2 className={`text-display text-2xl md:text-4xl mb-3 ${image ? "text-background" : "text-foreground"}`}>
          {heading}
        </h2>
        {subtitle && (
          <p className={`text-sm font-light mb-10 ${image ? "text-background/80" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}

        {timeLeft ? (
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-10">
            {units.filter(u => u.show).map((unit) => (
              <div key={unit.key} className="text-center">
                <div className={`text-4xl md:text-6xl font-light tabular-nums ${image ? "text-background" : "text-foreground"}`}>
                  {String(timeLeft[unit.key]).padStart(2, "0")}
                </div>
                <div className={`text-[10px] uppercase tracking-widest mt-1 ${image ? "text-background/60" : "text-muted-foreground"}`}>
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        ) : endDate ? (
          <p className={`text-lg font-light mb-10 ${image ? "text-background/80" : "text-muted-foreground"}`}>
            {expiredMessage}
          </p>
        ) : (
          <p className={`text-sm font-light mb-10 ${image ? "text-background/60" : "text-muted-foreground"}`}>
            Configure a data final para ativar o timer.
          </p>
        )}

        {ctaText && (
          <Link
            to={linkUrl}
            className={`inline-flex items-center px-8 py-3 text-sm tracking-wider transition-opacity hover:opacity-90 ${
              image ? "bg-background text-foreground" : "bg-foreground text-background"
            }`}
          >
            {ctaText}
          </Link>
        )}
      </motion.div>
    </section>
  );
};

export default CountdownSection;
