import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import type { GridLayout } from "../components/category/ProductGrid";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Category = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>("standard");
  const { data: settings } = useSiteSettings();

  const themeCategory = useMemo(() => ({
    layout: (settings?.theme_category_layout || "standard") as GridLayout,
    showHeader: settings?.theme_category_show_header !== "false",
    showFilters: settings?.theme_category_show_filters !== "false",
    showCount: settings?.theme_category_show_count !== "false",
    showSort: settings?.theme_category_show_sort !== "false",
  }), [settings]);

  useEffect(() => {
    const fetchLayout = async () => {
      if (!category) return;
      const { data } = await supabase
        .from("categories")
        .select("grid_layout")
        .eq("slug", category)
        .single();
      if (data?.grid_layout && data.grid_layout !== "standard") {
        // Category-specific layout overrides theme default
        setGridLayout(data.grid_layout as GridLayout);
      } else {
        // Use theme default
        setGridLayout(themeCategory.layout);
      }
    };
    fetchLayout();
  }, [category, themeCategory.layout]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8 md:pt-12">
        {themeCategory.showHeader && (
          <CategoryHeader category={category || 'All Products'} />
        )}
        
        {(themeCategory.showFilters || themeCategory.showSort || themeCategory.showCount) && (
          <FilterSortBar 
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            itemCount={24}
            showFilters={themeCategory.showFilters}
            showSort={themeCategory.showSort}
            showCount={themeCategory.showCount}
          />
        )}
        
        <ProductGrid layout={gridLayout} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;