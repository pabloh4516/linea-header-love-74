import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { productId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Mobile breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:hidden px-6 pt-4 pb-3"
        >
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

        {/* Product section */}
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Images - takes 7 cols on desktop, full bleed on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <ProductImageGallery />
            </motion.div>
            
            {/* Info - takes 5 cols on desktop, sticky */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 px-6 lg:px-10 xl:px-14 mt-6 lg:mt-0 lg:sticky lg:top-24 lg:h-fit lg:py-8"
            >
              <ProductInfo />
              <ProductDescription />
            </motion.div>
          </div>
        </section>
        
        {/* Related products */}
        <section className="w-full mt-20 lg:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 px-6"
          >
            <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">
              Sugestões
            </p>
            <h2 className="text-display text-2xl md:text-3xl text-foreground">Você também pode gostar</h2>
          </motion.div>
          <ProductCarousel />
        </section>
        
        <section className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-6 px-6"
          >
            <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">
              Explore mais
            </p>
            <h2 className="text-display text-2xl md:text-3xl text-foreground">Outros Brincos</h2>
          </motion.div>
          <ProductCarousel />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
