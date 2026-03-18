import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { HomepageSection } from "./SectionRenderer";
import type { Json } from "@/integrations/supabase/types";

function getConfig(config: Json | null | undefined): Record<string, string> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  return config as Record<string, string>;
}

function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return url;
}

interface Props { section?: HomepageSection; }

const VideoSection = ({ section }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [playing, setPlaying] = useState(false);
  const cfg = getConfig(section?.config);

  const videoUrl = cfg.video_url || "";
  const coverImage = section?.image_url || "";
  const heading = section?.title || "";
  const description = section?.description || "";
  const aspect = cfg.aspect || "16/9";

  return (
    <section data-theme-section="video" className="py-16 md:py-24 px-6 md:px-12">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        {(heading || description) && (
          <div className="text-center mb-8">
            {heading && <h2 className="text-display text-2xl md:text-4xl text-foreground mb-3">{heading}</h2>}
            {description && <p className="text-sm font-light text-muted-foreground max-w-lg mx-auto">{description}</p>}
          </div>
        )}

        <div className="relative overflow-hidden bg-muted/10" style={{ aspectRatio: aspect }}>
          {playing && videoUrl ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <>
              {coverImage && <img src={coverImage} alt={heading} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={() => videoUrl && setPlaying(true)}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/80 flex items-center justify-center hover:bg-white/10 transition-colors duration-300"
                >
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default VideoSection;
