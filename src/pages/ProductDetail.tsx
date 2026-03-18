import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import type { ProductInfoBlock } from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { usePageTemplate } from "@/hooks/usePageTemplates";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { theme } = useThemeConfig();
  const { data: template } = usePageTemplate("product");
  const isStacked = theme.pdpLayout === "stacked";

  // Extract product_info blocks from template
  const productInfoBlocks = useMemo((): ProductInfoBlock[] | undefined => {
    if (!template) return undefined;
    const order = (template.section_order || []) as string[];
    const sectionsMap = (template.sections || {}) as Record<string, any>;
    for (const id of order) {
      const section = sectionsMap[id];
      if (section?.type === "product_info" && section.is_visible !== false) {
        if (Array.isArray(section.blocks) && section.blocks.length > 0) {
          return section.blocks as ProductInfoBlock[];
        }
      }
    }
    return undefined;
  }, [template]);

  // Check if description block should show (part of product_info or standalone)
  const showDescription = useMemo(() => {
    if (productInfoBlocks) {
      const descBlock = productInfoBlocks.find(b => b.type === "description");
      return descBlock ? descBlock.visible : true;
    }
    return true;
  }, [productInfoBlocks]);

  // Filter out description from blocks passed to ProductInfo (rendered separately)
  const infoBlocks = useMemo(() => {
    if (!productInfoBlocks) return undefined;
    return productInfoBlocks.filter(b => b.type !== "description");
  }, [productInfoBlocks]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main>
        {theme.pdpShowBreadcrumb && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="lg:hidden px-6 pt-4 pb-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Início</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/category/earrings" className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Brincos</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-editorial text-[10px] tracking-[0.15em]">Pantheon</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        )}

        <section className="w-full pb-10 lg:pb-0">
          {isStacked ? (
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <ProductImageGallery />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="px-6 lg:px-10 xl:px-14 pb-6 mt-6"
              >
                <ProductInfo blocks={infoBlocks} />
                {showDescription && <ProductDescription />}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="lg:col-span-7">
                <ProductImageGallery />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`lg:col-span-5 px-6 lg:px-10 xl:px-14 pb-6 lg:pb-0 mt-6 lg:mt-0 ${
                  theme.pdpStickyInfo ? "lg:sticky lg:top-24 lg:h-fit lg:py-10 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)]" : "lg:py-10"
                }`}
              >
                <ProductInfo blocks={infoBlocks} />
                {showDescription && <ProductDescription />}
              </motion.div>
            </div>
          )}
        </section>

        {theme.pdpShowRelated && (
          <>
            <section className="w-full mt-16 lg:mt-32 px-6 md:px-0">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="mb-3 md:px-12">
                <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">Sugestões</p>
                <h2 className="text-display text-2xl md:text-3xl text-foreground">Você também pode gostar</h2>
              </motion.div>
              <ProductCarousel showHeader={false} />
            </section>

            <section className="w-full mt-10 lg:mt-16 pb-12 lg:pb-20 px-6 md:px-0">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="mb-3 md:px-12">
                <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">Explore mais</p>
                <h2 className="text-display text-2xl md:text-3xl text-foreground">Outros Brincos</h2>
              </motion.div>
              <ProductCarousel showHeader={false} />
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
