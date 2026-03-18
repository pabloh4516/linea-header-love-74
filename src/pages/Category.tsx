import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import type { GridLayout } from "../components/category/ProductGrid";
import { supabase } from "@/integrations/supabase/client";
import { useThemeConfig } from "@/hooks/useThemeConfig";

const Category = () => {
  const { category } = useParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>("standard");
  const { theme } = useThemeConfig();

  useEffect(() => {
    const fetchLayout = async () => {
      if (!category) return;
      const { data } = await supabase
        .from("categories")
        .select("grid_layout")
        .eq("slug", category)
        .single();
      if (data?.grid_layout && data.grid_layout !== "standard") {
        setGridLayout(data.grid_layout as GridLayout);
      } else {
        setGridLayout(theme.categoryLayout as GridLayout);
      }
    };
    fetchLayout();
  }, [category, theme.categoryLayout]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-8 md:pt-12">
        {theme.categoryShowHeader && (
          <CategoryHeader category={category || 'All Products'} />
        )}

        {(theme.categoryShowFilters || theme.categoryShowSort || theme.categoryShowCount) && (
          <FilterSortBar
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            itemCount={24}
            showFilters={theme.categoryShowFilters}
            showSort={theme.categoryShowSort}
            showCount={theme.categoryShowCount}
          />
        )}

        <ProductGrid layout={gridLayout} />
      </main>

      <Footer />
    </div>
  );
};

export default Category;
