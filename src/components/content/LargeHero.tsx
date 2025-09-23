import heroImage from "@/assets/hero-image.png";

const LargeHero = () => {
  return (
    <section className="w-full mb-16">
      <div className="w-full aspect-[16/9] mb-6 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Modern jewelry collection" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4">
        <h2 className="text-sm font-light text-foreground mb-2">
          Modern Heritage
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Contemporary jewelry crafted with timeless elegance
        </p>
      </div>
    </section>
  );
};

export default LargeHero;