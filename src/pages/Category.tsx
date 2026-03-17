import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import type { GridLayout } from "../components/category/ProductGrid";
import { supabase } from "@/integrations/supabase/client";

const Category = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>("standard");

  useEffect(() => {
    const fetchLayout = async () => {
      if (!category) return;
      const { data } = await supabase
        .from("categories")
        .select("grid_layout")
        .eq("slug", category)
        .single();
      if (data?.grid_layout) {
        setGridLayout(data.grid_layout as GridLayout);
      }
    };
    fetchLayout();
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8 md:pt-12">
        <CategoryHeader 
          category={category || 'All Products'} 
        />
        
        <FilterSortBar 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={24}
        />
        
        <ProductGrid layout={gridLayout} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;
