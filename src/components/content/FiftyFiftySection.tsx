import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

const FiftyFiftySection = () => {
  return (
    <section className="w-full mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="w-full aspect-square mb-6 overflow-hidden">
            <img 
              src={organicEarring} 
              alt="Organic earring design" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-4">
            <h3 className="text-sm font-light text-foreground mb-2">
              Organic Forms
            </h3>
            <p className="text-sm font-light text-muted-foreground">
              Nature-inspired pieces with fluid, sculptural details
            </p>
          </div>
        </div>

        <div>
          <div className="w-full aspect-square mb-6 overflow-hidden">
            <img 
              src={linkBracelet} 
              alt="Chain link bracelet" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-4">
            <h3 className="text-sm font-light text-foreground mb-2">
              Chain Collection
            </h3>
            <p className="text-sm font-light text-muted-foreground">
              Refined links and connections in precious metals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;