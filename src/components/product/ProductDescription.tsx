import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const ProductDescription = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Descrição</span>
          {isDescriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDescriptionOpen && (
          <div className="pb-6 space-y-4">
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
        )}
      </div>

      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Detalhes do Produto</span>
          {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">SKU</span>
              <span className="text-sm font-light text-foreground">LE-PTH-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Coleção</span>
              <span className="text-sm font-light text-foreground">Série Arquitetônica</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Fecho</span>
              <span className="text-sm font-light text-foreground">Tarraxa borboleta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Hipoalergênico</span>
              <span className="text-sm font-light text-foreground">Sim</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsCareOpen(!isCareOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Cuidados e Limpeza</span>
          {isCareOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isCareOpen && (
          <div className="pb-6 space-y-4">
            <ul className="space-y-2">
              <li className="text-sm font-light text-muted-foreground">• Limpe com um pano macio e seco após cada uso</li>
              <li className="text-sm font-light text-muted-foreground">• Evite contato com perfumes, cremes e produtos de limpeza</li>
              <li className="text-sm font-light text-muted-foreground">• Guarde na bolsinha de joias fornecida quando não estiver usando</li>
              <li className="text-sm font-light text-muted-foreground">• Remova antes de nadar, se exercitar ou tomar banho</li>
            </ul>
            <p className="text-sm font-light text-muted-foreground">
              Para limpeza profissional, visite seu joalheiro local ou entre em contato com nosso atendimento ao cliente.
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-border lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => setIsReviewsOpen(!isReviewsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span>Avaliações de Clientes</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar key={star} filled={star <= 4.8} />
              ))}
              <span className="text-sm font-light text-muted-foreground ml-1">4.8</span>
            </div>
          </div>
          {isReviewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isReviewsOpen && (
          <div className="pb-6 space-y-6">
            <ReviewProduct />

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled={true} />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Ana M.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "Brincos absolutamente deslumbrantes! A qualidade é excepcional e combinam com tudo. 
                  O design arquitetônico é tão único e recebo elogios toda vez que uso."
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled={star <= 4} />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Carla T.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "Artesanato lindo e confortável para usar o dia todo. O banho de ouro se manteve 
                  perfeitamente após meses de uso regular. Super recomendo!"
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar key={star} filled={true} />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Julia R.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "Estes brincos são uma obra de arte. O design minimalista é elegante e sofisticado. 
                  Peso perfeito e a embalagem também era linda."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
