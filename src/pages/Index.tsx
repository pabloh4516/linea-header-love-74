import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import SectionRenderer from "../components/content/SectionRenderer";
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SectionRenderer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
