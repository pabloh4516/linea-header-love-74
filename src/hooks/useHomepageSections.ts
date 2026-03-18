import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Section = Database["public"]["Tables"]["homepage_sections"]["Row"];
type SectionInsert = Database["public"]["Tables"]["homepage_sections"]["Insert"];
type SectionUpdate = Database["public"]["Tables"]["homepage_sections"]["Update"];

export const useHomepageSections = (visibleOnly = false) => {
  return useQuery({
    queryKey: ["homepage-sections", visibleOnly],
    queryFn: async () => {
      let query = supabase.from("homepage_sections").select("*").order("sort_order");
      if (visibleOnly) query = query.eq("is_visible", true);
      const { data, error } = await query;
      if (error) throw error;
      return data as Section[];
    },
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...section }: SectionUpdate & { id: string }) => {
      const { data, error } = await supabase.from("homepage_sections").update(section).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage-sections"] }),
  });
};

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (section: SectionInsert) => {
      const { data, error } = await supabase.from("homepage_sections").insert(section).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage-sections"] }),
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["homepage-sections"] }),
  });
};
