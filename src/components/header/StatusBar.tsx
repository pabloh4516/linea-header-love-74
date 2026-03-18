import { useEffect, useState, useMemo } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const StatusBar = () => {
  const { data: settings } = useSiteSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  const visible = settings?.theme_statusbar_visible !== "false";

  const usps = useMemo(() => {
    const texts: string[] = [];
    const t1 = settings?.theme_statusbar_text_1 || "Frete grátis acima de R$250";
    const t2 = settings?.theme_statusbar_text_2 || "Garantia de 365 dias";
    const t3 = settings?.theme_statusbar_text_3 || "+100.000 clientes satisfeitos";
    if (t1) texts.push(t1);
    if (t2) texts.push(t2);
    if (t3) texts.push(t3);
    return texts.length > 0 ? texts : ["Frete grátis acima de R$250"];
  }, [settings]);

  const rotationSpeed = parseInt(settings?.theme_statusbar_rotation_speed || "3000", 10);
  const height = settings?.theme_statusbar_height;
  const fontSize = settings?.theme_statusbar_font_size;

  useEffect(() => {
    if (usps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % usps.length);
    }, rotationSpeed);
    return () => clearInterval(interval);
  }, [usps.length, rotationSpeed]);

  if (!visible) return null;

  return (
    <div
      data-theme-section="statusbar"
      className="bg-status-bar text-status-bar-foreground flex items-center justify-center"
      style={{
        height: height ? `${height}px` : undefined,
        minHeight: height ? `${height}px` : undefined,
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <p
          key={currentIndex}
          className="text-editorial font-light transition-all duration-700 ease-in-out opacity-100 animate-fade-in"
          style={{
            fontSize: fontSize ? `${fontSize}px` : "10px",
            letterSpacing: "0.2em",
          }}
        >
          {usps[currentIndex]}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
