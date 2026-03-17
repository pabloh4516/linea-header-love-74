import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CategoryHeaderProps {
  category: string;
}

const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <section className="w-full px-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
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
              <BreadcrumbPage className="text-editorial text-[10px] tracking-[0.15em]">{capitalizedCategory}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <p className="text-editorial text-[10px] md:text-xs text-muted-foreground tracking-[0.2em] mb-2">
          Coleção
        </p>
        <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-foreground">
          {capitalizedCategory}
        </h1>
      </motion.div>
    </section>
  );
};

export default CategoryHeader;
