import founders from "@/assets/founders.png";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EditorialSection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 max-w-[630px]">
          <h2 className="text-2xl font-normal text-foreground leading-tight md:text-xl">
            Joias Nascidas de Sombras e Linhas
          </h2>
          <p className="text-sm font-light text-foreground leading-relaxed">
            A Linea nasceu do encontro de duas mentes que viam beleza não apenas no ornamento, mas na estrutura. Com formações em arquitetura e belas artes, as fundadoras acreditavam que joias poderiam ser mais do que decoração — poderiam ser uma extensão do espaço, da luz e da linha.
          </p>
          <Link to="/about/our-story" className="inline-flex items-center gap-1 text-sm font-light text-foreground hover:text-foreground/80 transition-colors duration-200">
            <span>Leia nossa história completa</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        
        <div className="order-first md:order-last">
          <div className="w-full aspect-square overflow-hidden">
            <img src={founders} alt="Fundadoras da Linea usando joias minimalistas" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
