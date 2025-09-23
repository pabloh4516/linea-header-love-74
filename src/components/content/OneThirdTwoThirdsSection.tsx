import circularCollection from "@/assets/circular-collection.png";
import organicEarring from "@/assets/organic-earring.png";

const OneThirdTwoThirdsSection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
            <img 
              src={organicEarring} 
              alt="Artisan crafted jewelry" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              Artisan Craft
            </h3>
            <p className="text-sm font-light text-foreground">
              Handcrafted pieces with meticulous attention to detail
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
            <img 
              src={circularCollection} 
              alt="Circular jewelry collection" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              Circular Elements
            </h3>
            <p className="text-sm font-light text-foreground">
              Geometric perfection meets contemporary minimalism
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;