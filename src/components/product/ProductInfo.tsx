import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Minus, Plus } from "lucide-react";

const ProductInfo = () => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
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
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-editorial text-[10px] tracking-[0.2em] text-muted-foreground mb-2">Brincos</p>
            <h1 className="text-display text-3xl md:text-4xl text-foreground">Pantheon</h1>
          </div>
          <div className="text-right">
            <p className="text-display text-xl md:text-2xl text-foreground">R$2.850</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 py-5 border-b border-border">
        <div className="space-y-1">
          <h3 className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground">Material</h3>
          <p className="text-sm font-light text-foreground">Prata 925 com Banho de Ouro 18k</p>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground">Dimensões</h3>
          <p className="text-sm font-light text-foreground">2,5cm x 1,2cm</p>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground">Peso</h3>
          <p className="text-sm font-light text-foreground">4,2g por brinco</p>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground">Notas do Editor</h3>
          <p className="text-sm font-light text-foreground/80 italic leading-relaxed">"Uma interpretação moderna da arquitetura clássica, estes brincos unem elegância atemporal com minimalismo contemporâneo."</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-editorial text-[10px] tracking-[0.15em] text-muted-foreground">Quantidade</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Button 
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none text-editorial text-xs tracking-[0.15em]"
        >
          Adicionar à Sacola
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
