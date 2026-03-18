import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import NotFound from "./NotFound";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) return <NotFound />;

  // Split content into paragraphs
  const paragraphs = (page.content || "").split("\n").filter((p: string) => p.trim());

  return (
    <div className="min-h-screen flex flex-col">
      {page.meta_title && <title>{page.meta_title}</title>}
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-8">
            {page.title}
          </h1>
          <div className="prose prose-neutral max-w-none space-y-4">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            {paragraphs.length === 0 && (
              <p className="text-muted-foreground text-[15px]">Esta página ainda não possui conteúdo.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
