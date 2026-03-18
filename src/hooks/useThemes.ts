import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Theme {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  author: string | null;
  version: string;
  thumbnail_url: string | null;
  is_active: boolean;
  settings_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useActiveTheme = () => {
  return useQuery({
    queryKey: ["themes", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes" as any)
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Theme | null;
    },
  });
};

export const useAllThemes = () => {
  return useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes" as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) as Theme[];
    },
  });
};

export const useActivateTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (themeId: string) => {
      // Deactivate all themes first
      const { error: deactivateError } = await supabase
        .from("themes" as any)
        .update({ is_active: false } as any)
        .neq("id", themeId);
      if (deactivateError) throw deactivateError;

      // Activate the selected theme
      const { data, error } = await supabase
        .from("themes" as any)
        .update({ is_active: true } as any)
        .eq("id", themeId)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Theme;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["themes"] });
    },
  });
};
