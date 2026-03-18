import { useHomepageSections } from "@/hooks/useHomepageSections";
import type { Database } from "@/integrations/supabase/types";
import ImmersiveHero from "./ImmersiveHero";
import AsymmetricGrid from "./AsymmetricGrid";
import ProductCarousel from "./ProductCarousel";
import FullWidthBanner from "./FullWidthBanner";
import StorySection from "./StorySection";
import FiftyFiftySection from "./FiftyFiftySection";
import OneThirdTwoThirdsSection from "./OneThirdTwoThirdsSection";
import EditorialSection from "./EditorialSection";
import LargeHero from "./LargeHero";

export type HomepageSection = Database["public"]["Tables"]["homepage_sections"]["Row"];

const SECTION_MAP: Record<string, React.ComponentType<{ section?: HomepageSection }>> = {
  hero: ImmersiveHero,
  asymmetric_grid: AsymmetricGrid,
  product_carousel: ProductCarousel,
  full_width_banner: FullWidthBanner,
  story: StorySection,
  fifty_fifty: FiftyFiftySection,
  one_third_two_thirds: OneThirdTwoThirdsSection,
  editorial: EditorialSection,
  large_hero: LargeHero,
};

const SectionRenderer = () => {
  const { data: sections, isLoading } = useHomepageSections(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  // If no sections in DB, return null so Index.tsx can render defaults
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => {
        const Component = SECTION_MAP[section.section_type];
        if (!Component) return null;
        return <Component key={section.id} section={section} />;
      })}
    </>
  );
};

export default SectionRenderer;
