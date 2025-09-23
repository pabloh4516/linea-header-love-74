import { Search, User, ShoppingBag, ArrowRight, Heart, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | 'cart' | null>(null);
  
  // Preload dropdown images for faster display
  useEffect(() => {
    const imagesToPreload = [
      "/rings-collection.png",
      "/earrings-collection.png", 
      "/arcus-bracelet.png",
      "/span-bracelet.png",
      "/founders.png"
    ];
    
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const popularSearches = [
    "Gold Rings",
    "Silver Necklaces", 
    "Pearl Earrings",
    "Designer Bracelets",
    "Wedding Rings",
    "Vintage Collection"
  ];
  
  const navItems = [
    { 
      name: "Shop", 
      href: "/shop",
      submenuItems: [
        "Rings",
        "Necklaces", 
        "Earrings",
        "Bracelets",
        "Watches"
      ],
      images: [
        { src: "/rings-collection.png", alt: "Rings Collection", label: "Rings" },
        { src: "/earrings-collection.png", alt: "Earrings Collection", label: "Earrings" }
      ]
    },
    { 
      name: "New in", 
      href: "/new-in",
      submenuItems: [
        "This Week's Arrivals",
        "Spring Collection",
        "Featured Designers",
        "Limited Edition",
        "Pre-Orders"
      ],
      images: [
        { src: "/arcus-bracelet.png", alt: "Arcus Bracelet", label: "Arcus Bracelet" },
        { src: "/span-bracelet.png", alt: "Span Bracelet", label: "Span Bracelet" }
      ]
    },
    { 
      name: "About", 
      href: "/about",
      submenuItems: [
        "Our Story",
        "Sustainability",
        "Size Guide",
        "Customer Care",
        "Store Locator"
      ],
      images: [
        { src: "/founders.png", alt: "Company Founders", label: "Read our story" }
      ]
    }
  ];

  return (
    <nav className="bg-nav border-b border-border relative">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left navigation */}
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </a>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <a href="/" className="text-2xl font-light tracking-wider text-foreground">
            LINEA
          </a>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={20} />
          </button>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Favorites"
            onClick={() => setOffCanvasType('favorites')}
          >
            <Heart size={20} />
          </button>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={() => setOffCanvasType('cart')}
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      {/* Full width dropdown */}
      {activeDropdown && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items */}
              <div className="flex-1">
                <ul className="space-y-2">
                  {navItems
                    .find(item => item.name === activeDropdown)
                    ?.submenuItems.map((subItem, index) => (
                    <li key={index}>
                      <a 
                        href="#"
                        className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-2"
                      >
                        {subItem}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-6">
                {navItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => (
                  <div key={index} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden">
                    <img 
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                    />
                    {(activeDropdown === "Shop" || activeDropdown === "New in" || activeDropdown === "About") && (
                      <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                        <span>{image.label}</span>
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
        >
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Search input */}
              <div className="relative mb-8">
                <div className="flex items-center border-b border-border pb-2">
                  <Search size={20} className="text-nav-foreground mr-3" />
                  <input
                    type="text"
                    placeholder="Search for jewelry..."
                    className="flex-1 bg-transparent text-nav-foreground placeholder:text-nav-foreground/60 outline-none text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {/* Popular searches */}
              <div>
                <h3 className="text-nav-foreground text-sm font-light mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-nav-foreground hover:text-nav-hover text-sm font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-nav-hover"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Off-canvas overlay */}
      {offCanvasType && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setOffCanvasType(null)}
          />
          
          {/* Off-canvas panel */}
          <div className="absolute right-0 top-0 h-full w-96 bg-background border-l border-border animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-light text-foreground">
                {offCanvasType === 'favorites' ? 'Your Favorites' : 'Shopping Bag'}
              </h2>
              <button
                onClick={() => setOffCanvasType(null)}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {offCanvasType === 'favorites' ? (
                <div>
                  <p className="text-muted-foreground text-sm mb-6">
                    You haven't added any favorites yet. Browse our collection and click the heart icon to save items you love.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your shopping bag is empty. Continue shopping to add items to your bag.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;