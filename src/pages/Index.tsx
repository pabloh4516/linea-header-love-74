import Header from "../components/header/Header";
import LargeHero from "../components/content/LargeHero";
import FiftyFiftySection from "../components/content/FiftyFiftySection";
import OneThirdTwoThirdsSection from "../components/content/OneThirdTwoThirdsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <LargeHero />
        <FiftyFiftySection />
        <OneThirdTwoThirdsSection />
      </main>
    </div>
  );
};

export default Index;
