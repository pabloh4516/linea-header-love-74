import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { data: settings } = useSiteSettings();

  const pdp = useMemo(() => ({
    layout: settings?.theme_pdp_layout || "side-by-side",
    showBreadcrumb: settings?.theme_pdp_show_breadcrumb !== "false",
    showEditorNotes: settings?.theme_pdp_show_editor_notes !== "false",
    showDetailsGrid: settings?.theme_pdp_show_details_grid !== "false",
    showTrustBadges: settings?.theme_pdp_show_trust_badges !== "false",
    stickyInfo: settings?.theme_pdp_sticky_info !== "false",
    showRelated: settings?.theme_pdp_show_related !== "false",
    showSku: settings?.theme_pdp_show_sku === "true",
  }), [settings]);

  const isStacked = pdp.layout === "stacked";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main>
        {/* Mobile breadcrumb */}
        {pdp.showBreadcrumb && (
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

        {/* Product section */}
        <section className="w-full pb-10 lg:pb-0">
          {isStacked ? (
            /* Stacked layout */
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <ProductImageGallery />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="px-6 lg:px-10 xl:px-14 pb-6 mt-6"
              >
                <ProductInfo showBreadcrumb={pdp.showBreadcrumb} showEditorNotes={pdp.showEditorNotes} showDetailsGrid={pdp.showDetailsGrid} showTrustBadges={pdp.showTrustBadges} showSku={pdp.showSku} />
                <ProductDescription />
              </motion.div>
            </div>
          ) : (
            /* Side-by-side layout (default) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="lg:col-span-7">
                <ProductImageGallery />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`lg:col-span-5 px-6 lg:px-10 xl:px-14 pb-6 lg:pb-0 mt-6 lg:mt-0 ${
                  pdp.stickyInfo ? "lg:sticky lg:top-24 lg:h-fit lg:py-10 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)]" : "lg:py-10"
                }`}
              >
                <ProductInfo showBreadcrumb={pdp.showBreadcrumb} showEditorNotes={pdp.showEditorNotes} showDetailsGrid={pdp.showDetailsGrid} showTrustBadges={pdp.showTrustBadges} showSku={pdp.showSku} />
                <ProductDescription />
              </motion.div>
            </div>
          )}
        </section>

        {/* Related products */}
        {pdp.showRelated && (
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