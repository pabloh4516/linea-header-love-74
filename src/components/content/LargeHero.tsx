import heroImage from "@/assets/hero-image.png";
import type { HomepageSection } from "./SectionRenderer";

interface Props {
  section?: HomepageSection;
}

const LargeHero = ({ section }: Props) => {
  const image = section?.image_url || heroImage;
  const title = section?.title || "Herança Moderna";
  const subtitle = section?.subtitle || "Joias contemporâneas criadas com elegância atemporal";

  return (
    <section className="w-full mb-16 px-6">
      <div className="w-full aspect-[16/9] mb-3 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div>
        <h2 className="text-sm font-normal text-foreground mb-1">{title}</h2>
        <p className="text-sm font-light text-foreground">{subtitle}</p>
      </div>
    </section>
  );
};

export default LargeHero;
