import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteSettings = () => {
  const [previewOverrides, setPreviewOverrides] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((s) => { if (s.key && s.value) map[s.key] = s.value; });
      return map;
    },
  });

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "theme-preview-update" && e.data.theme) {
        setPreviewOverrides((prev) => ({ ...prev, ...(e.data.theme as Record<string, string>) }));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const data = useMemo(() => {
    return { ...(query.data || {}), ...previewOverrides };
  }, [query.data, previewOverrides]);

  return {
    ...query,
    data,
  };
};

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
};
