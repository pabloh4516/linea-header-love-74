import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import SectionRenderer from "../components/content/SectionRenderer";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import ImmersiveHero from "../components/content/ImmersiveHero";
import AsymmetricGrid from "../components/content/AsymmetricGrid";
import ProductCarousel from "../components/content/ProductCarousel";
import StorySection from "../components/content/StorySection";
import FullWidthBanner from "../components/content/FullWidthBanner";

const DefaultSections = () => (
  <>
    <ImmersiveHero />
    <AsymmetricGrid />
    <ProductCarousel />
    <FullWidthBanner />
    <StorySection />
  </>
);

const Index = () => {
  const { data: sections, isLoading } = useHomepageSections(true);
  const hasDbSections = !isLoading && sections && sections.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : hasDbSections ? (
          <SectionRenderer />
        ) : (
          <DefaultSections />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
