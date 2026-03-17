import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_visible", true)
        .order("sort_order");

      if (categorySlug) {
        query = supabase
          .from("products")
          .select("*, categories!inner(name, slug)")
          .eq("is_visible", true)
          .eq("categories.slug", categorySlug)
          .order("sort_order");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase.from("products").insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...product }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
};
