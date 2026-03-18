import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageTemplate {
  id: string;
  page_type: string;
  name: string;
  sections: Record<string, { type: string; settings: Record<string, any>; blocks?: any[] }>;
  section_order: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const usePageTemplate = (pageType: string) => {
  return useQuery({
    queryKey: ["page-template", pageType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_templates" as any)
        .select("*")
        .eq("page_type", pageType)
        .eq("is_default", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as PageTemplate | null;
    },
    enabled: !!pageType,
  });
};

export const useSavePageTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (template: {
      id?: string;
      page_type: string;
      name: string;
      sections: Record<string, any>;
      section_order: string[];
      is_default?: boolean;
    }) => {
      if (template.id) {
        const { id, ...updates } = template;
        const { data, error } = await supabase
          .from("page_templates" as any)
          .update(updates as any)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as unknown as PageTemplate;
      } else {
        const { data, error } = await supabase
          .from("page_templates" as any)
          .insert(template as any)
          .select()
          .single();
        if (error) throw error;
        return data as unknown as PageTemplate;
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["page-template", variables.page_type] });
    },
  });
};
