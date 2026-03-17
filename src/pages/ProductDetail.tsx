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
      
      <main className="pt-6">
        <section className="w-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden mb-6"
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductImageGallery />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit"
            >
              <ProductInfo />
              <ProductDescription />
            </motion.div>
          </div>
        </section>
        
        <section className="w-full mt-16 lg:mt-24">
          <div className="mb-4 px-6">
            <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">
              Sugestões
            </p>
            <h2 className="text-display text-xl md:text-2xl text-foreground">Você também pode gostar</h2>
          </div>
          <ProductCarousel />
        </section>
        
        <section className="w-full">
          <div className="mb-4 px-6">
            <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-1">
              Explore mais
            </p>
            <h2 className="text-display text-xl md:text-2xl text-foreground">Outros Brincos</h2>
          </div>
          <ProductCarousel />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
