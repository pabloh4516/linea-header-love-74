import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const upload = async (file: File, folder = "products") => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  return { upload };
};
