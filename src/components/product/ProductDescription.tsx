import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ReviewProduct from "./ReviewProduct";

const CustomStar = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className={`w-3 h-3 ${filled ? 'text-foreground' : 'text-muted-foreground/30'} ${className}`}
  >
    <path 
      fillRule="evenodd" 
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" 
      clipRule="evenodd" 
    />
  </svg>
);

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

const AccordionItem = ({ title, isOpen, onToggle, children, badge }: AccordionItemProps) => (
  <div className="border-b border-border">
    <button
      onClick={onToggle}
      className="w-full h-14 px-0 flex items-center justify-between text-left hover:opacity-70 transition-opacity duration-300"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-light text-foreground">{title}</span>
        {badge}
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ProductDescription = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      <AccordionItem
        title="Descrição"
        isOpen={isDescriptionOpen}
        onToggle={() => setIsDescriptionOpen(!isDescriptionOpen)}
      >
        <div className="space-y-4">
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Os brincos Pantheon incorporam elegância arquitetônica com seu design limpo e geométrico. 
            Inspirados na arquitetura clássica romana, estas peças de destaque apresentam uma sofisticada 
            interação de curvas e ângulos que capturam e refletem a luz de forma bela.
          </p>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Cada brinco é meticulosamente produzido em prata 925 premium com banho de ouro 18k, 
            garantindo durabilidade e luxo. A estética minimalista os torna perfeitos tanto para 
            o uso diário quanto para ocasiões especiais.
          </p>
        </div>
      </AccordionItem>

      <AccordionItem
        title="Detalhes do Produto"
        isOpen={isDetailsOpen}
        onToggle={() => setIsDetailsOpen(!isDetailsOpen)}
      >
        <div className="grid grid-cols-2 gap-y-3 gap-x-8">
          {[
            { label: "SKU", value: "LE-PTH-001" },
            { label: "Coleção", value: "Série Arquitetônica" },
            { label: "Fecho", value: "Tarraxa borboleta" },
            { label: "Hipoalergênico", value: "Sim" },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <span className="text-editorial text-[9px] tracking-[0.15em] text-muted-foreground">{item.label}</span>
              <p className="text-sm font-light text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem
        title="Cuidados e Limpeza"
        isOpen={isCareOpen}
        onToggle={() => setIsCareOpen(!isCareOpen)}
      >
        <div className="space-y-4">
          <ul className="space-y-2.5">
            {[
              "Limpe com um pano macio e seco após cada uso",
              "Evite contato com perfumes, cremes e produtos de limpeza",
              "Guarde na bolsinha de joias fornecida quando não estiver usando",
              "Remova antes de nadar, se exercitar ou tomar banho",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-light text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm font-light text-muted-foreground">
            Para limpeza profissional, visite seu joalheiro local ou entre em contato com nosso atendimento ao cliente.
          </p>
        </div>
      </AccordionItem>

      <AccordionItem
        title="Avaliações"
        isOpen={isReviewsOpen}
        onToggle={() => setIsReviewsOpen(!isReviewsOpen)}
        badge={
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar key={star} filled={star <= 4.8} />
              ))}
            </div>
            <span className="text-[10px] font-light text-muted-foreground">4.8</span>
          </div>
        }
      >
        <div className="space-y-6">
          <ReviewProduct />
          
          {[
            { name: "Ana M.", rating: 5, text: "Brincos absolutamente deslumbrantes! A qualidade é excepcional e combinam com tudo. O design arquitetônico é tão único e recebo elogios toda vez que uso." },
            { name: "Carla T.", rating: 4, text: "Artesanato lindo e confortável para usar o dia todo. O banho de ouro se manteve perfeitamente após meses de uso regular. Super recomendo!" },
            { name: "Julia R.", rating: 5, text: "Estes brincos são uma obra de arte. O design minimalista é elegante e sofisticado. Peso perfeito e a embalagem também era linda." },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[9px] font-medium text-muted-foreground">{review.name.charAt(0)}</span>
                </div>
                <span className="text-editorial text-[9px] tracking-[0.1em] text-muted-foreground">{review.name}</span>
                <div className="flex ml-auto">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <CustomStar key={star} filled={star <= review.rating} />
                  ))}
                </div>
              </div>
              <p className="text-sm font-light text-muted-foreground leading-relaxed pl-8">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
};

export default ProductDescription;
