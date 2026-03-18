import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  sku_suffix: string | null;
  stock: number;
  sort_order: number;
  is_available: boolean;
}

export const useProductVariants = (productId?: string) =>
  useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });

export const useCreateVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, "id">) => {
      const { data, error } = await supabase
        .from("product_variants")
        .insert(variant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["product-variants", v.product_id] });
    },
  });
};

export const useUpdateVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<ProductVariant> & { id: string }) => {
      const { error } = await supabase.from("product_variants").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-variants"] });
    },
  });
};

export const useDeleteVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_variants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-variants"] });
    },
  });
};
