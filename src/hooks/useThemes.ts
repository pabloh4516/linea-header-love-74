import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  settings: Record<string, string>;
  preview_colors: Record<string, string>;
  is_preset: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useThemes = () => {
  return useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes" as any)
        .select("*")
        .order("is_preset", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) as Theme[];
    },
  });
};

export const useCreateTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (theme: {
      name: string;
      description?: string;
      settings: Record<string, string>;
      preview_colors?: Record<string, string>;
      is_preset?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("themes" as any)
        .insert(theme as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Theme;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themes"] }),
  });
};

export const useUpdateTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<Theme, "id" | "created_at" | "updated_at">>) => {
      const { data, error } = await supabase
        .from("themes" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Theme;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themes"] }),
  });
};

export const useDeleteTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("themes" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["themes"] }),
  });
};
