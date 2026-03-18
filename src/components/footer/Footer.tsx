import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer data-theme-section="footer" className="w-full bg-foreground text-background pt-16 pb-4 px-6 md:px-12 mt-0">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <img 
              src="/Linea_Jewelry_Inc-2.svg" 
              alt="Linea Jewelry Inc." 
              className="mb-6 h-6 w-auto invert"
            />
            <p className="text-sm font-light text-background/60 leading-relaxed max-w-md mb-8">
              Joias minimalistas feitas para o indivíduo moderno
            </p>
            
            <div className="space-y-2 text-sm font-light text-background/60">
              <div>
                <p className="font-normal text-background/80 mb-1">Visite-nos</p>
                <p>Rua Oscar Freire, 123</p>
                <p>São Paulo, SP 01426-001</p>
              </div>
              <div>
                <p className="font-normal text-background/80 mb-1 mt-4">Contato</p>
                <p>+55 (11) 3456-7890</p>
                <p>contato@lineajewelry.com.br</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Loja</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Novidades</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Anéis</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Brincos</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Pulseiras</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Colares</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Suporte</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Guia de Tamanhos</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Cuidados</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Trocas e Devoluções</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Envio</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Conecte-se</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Instagram</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Pinterest</a></li>
                <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Newsletter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-background/10 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs font-light text-background/40 mb-2 md:mb-0">
            © 2024 Linea. Todos os direitos reservados. Template por{" "}
            <a href="https://www.liljeros.co" target="_blank" rel="noopener noreferrer" className="hover:text-background/70 transition-colors underline">
              Rickard Liljeros
            </a>
          </p>
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-xs font-light text-background/40 hover:text-background/70 transition-colors">
              Política de Privacidade
            </a>
            <a href="/terms-of-service" className="text-xs font-light text-background/40 hover:text-background/70 transition-colors">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
