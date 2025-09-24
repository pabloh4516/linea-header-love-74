import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
}

const FilterSortBar = ({ filtersOpen, setFiltersOpen }: FilterSortBarProps) => {
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["Earrings", "Bracelets", "Rings", "Necklaces"];
  const priceRanges = ["Under €1,000", "€1,000 - €2,000", "€2,000 - €3,000", "Over €3,000"];
  const materials = ["Gold", "Silver", "Rose Gold", "Platinum"];

  return (
    <>
      <section className="w-full px-6 mb-8 border-b border-border pb-4">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
          <div className="flex items-center gap-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2 font-light hover:bg-transparent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                  </svg>
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-none shadow-none">
                <SheetHeader className="mb-6 border-b border-border pb-4">
                  <SheetTitle className="text-lg font-light">Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-8">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Category</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-3">
                          <Checkbox id={category} className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" />
                          <Label htmlFor={category} className="text-sm font-light text-foreground cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Price</h3>
                    <div className="space-y-3">
                      {priceRanges.map((range) => (
                        <div key={range} className="flex items-center space-x-3">
                          <Checkbox id={range} className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" />
                          <Label htmlFor={range} className="text-sm font-light text-foreground cursor-pointer">
                            {range}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Material Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Material</h3>
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div key={material} className="flex items-center space-x-3">
                          <Checkbox id={material} className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" />
                          <Label htmlFor={material} className="text-sm font-light text-foreground cursor-pointer">
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="ghost" size="sm" className="w-full border-none hover:bg-transparent hover:underline font-normal text-left justify-start">
                      Apply Filters
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full border-none hover:bg-transparent hover:underline font-light text-left justify-start">
                      Clear All
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L2.2 5.74a.75.75 0 0 0 .04 1.06Zm8 6.4a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z" clipRule="evenodd" />
              </svg>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 border-none bg-transparent text-sm font-light shadow-none rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border-none rounded-none bg-background">
                  <SelectItem value="featured" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Featured</SelectItem>
                  <SelectItem value="price-low" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Price: High to Low</SelectItem>
                  <SelectItem value="newest" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Newest</SelectItem>
                  <SelectItem value="name" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FilterSortBar;