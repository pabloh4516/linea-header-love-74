import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Heart } from "lucide-react";
import { toast } from "sonner";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import pantheonImage from "@/assets/pantheon.jpg";

export interface ProductInfoBlock {
  type: string;
  visible: boolean;
}

interface ProductInfoProps {
  blocks?: ProductInfoBlock[];
  showBreadcrumb?: boolean;
  showEditorNotes?: boolean;
  showDetailsGrid?: boolean;
  showTrustBadges?: boolean;
  showSku?: boolean;
}

const DEFAULT_BLOCKS: ProductInfoBlock[] = [
  { type: "breadcrumb", visible: true },
  { type: "title", visible: true },
  { type: "price", visible: true },
  { type: "sku", visible: false },
  { type: "details_grid", visible: true },
  { type: "editor_notes", visible: true },
  { type: "quantity_selector", visible: true },
  { type: "add_to_cart", visible: true },
  { type: "trust_badges", visible: true },
];

const ProductInfo = ({
  blocks,
  showBreadcrumb,
  showEditorNotes,
  showDetailsGrid,
  showTrustBadges,
  showSku,
}: ProductInfoProps) => {
  const { theme } = useThemeConfig();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleFavoriteToggle = () => {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    toast.success(nextValue ? "Produto salvo nos favoritos" : "Produto removido dos favoritos");
  };

  const handleAddToBag = () => {
    window.dispatchEvent(
      new CustomEvent("linea:add-to-cart", {
        detail: { id: 1, name: "Pantheon", price: "R$2.850", image: pantheonImage, quantity, category: "Brincos" },
      }),
    );
    toast.success(`${quantity} item(ns) adicionado(s) à sacola`);
  };

  const btnStyle: React.CSSProperties = {
    borderRadius: `${theme.buttonRadius}px`,
    height: `${theme.buttonHeight}px`,
    fontSize: `${theme.buttonFontSize}px`,
    letterSpacing: `${theme.buttonLetterSpacing}em`,
    fontWeight: Number(theme.buttonFontWeight),
  };

  // Block visibility resolution: blocks prop > theme defaults > prop overrides
  const resolvedBlocks = blocks || DEFAULT_BLOCKS;

  const isBlockVisible = (blockType: string): boolean => {
    const block = resolvedBlocks.find(b => b.type === blockType);
    if (block) return block.visible;
    // Fallback to theme-based or prop-based visibility
    switch (blockType) {
      case "breadcrumb": return showBreadcrumb ?? theme.pdpShowBreadcrumb;
      case "editor_notes": return showEditorNotes ?? theme.pdpShowEditorNotes;
      case "details_grid": return showDetailsGrid ?? theme.pdpShowDetailsGrid;
      case "trust_badges": return showTrustBadges ?? theme.pdpShowTrustBadges;
      case "sku": return showSku ?? theme.pdpShowSku;
      default: return true;
    }
  };

  // Block renderers
  const renderBlock = (blockType: string) => {
    if (!isBlockVisible(blockType)) return null;

    switch (blockType) {
      case "breadcrumb":
        return (
          <div key="breadcrumb" className="hidden lg:block">
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
        );

      case "title":
        return (
          <div key="title" className="space-y-1">
            <p className="text-editorial text-[10px] tracking-[0.2em] text-muted-foreground">Brincos</p>
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-display text-3xl md:text-4xl text-foreground leading-tight">Pantheon</h1>
              <button type="button" onClick={handleFavoriteToggle} className="p-2 -mr-2 mt-1 transition-colors duration-300" aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                <Heart className={`h-5 w-5 transition-all duration-300 ${isFavorite ? "fill-foreground text-foreground scale-110" : "text-muted-foreground hover:text-foreground"}`} />
              </button>
            </div>
          </div>
        );

      case "price":
        return (
          <div key="price">
            <p className="text-display text-xl text-foreground">R$2.850</p>
          </div>
        );

      case "sku":
        return (
          <div key="sku">
            <p className="text-editorial text-[9px] tracking-[0.15em] text-muted-foreground">SKU: LE-PTH-001</p>
          </div>
        );

      case "variant_selector":
        return (
          <div key="variant_selector" className="space-y-2">
            <span className="text-editorial text-[9px] tracking-[0.15em] text-muted-foreground">Variante</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-foreground text-foreground">Padrão</button>
            </div>
          </div>
        );

      case "quantity_selector":
        return (
          <div key="quantity_selector" className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-editorial text-[9px] tracking-[0.15em] text-muted-foreground">Quantidade</span>
            <div className="flex items-center border border-border">
              <Button type="button" variant="ghost" size="sm" onClick={decrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Diminuir quantidade">
                <Minus className="h-3 w-3" />
              </Button>
              <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">{quantity}</span>
              <Button type="button" variant="ghost" size="sm" onClick={incrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Aumentar quantidade">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

      case "add_to_cart":
        return (
          <div key="add_to_cart">
            <Button
              type="button" onClick={handleAddToBag}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-light text-editorial tracking-[0.15em] transition-all duration-300 hover:tracking-[0.25em]"
              style={btnStyle}
            >
              Adicionar à Sacola
            </Button>
          </div>
        );

      case "details_grid":
        return (
          <div key="details_grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-border">
            <div className="space-y-1">
              <h3 className="text-editorial text-[9px] tracking-[0.2em] text-muted-foreground">Material</h3>
              <p className="text-sm font-light text-foreground">Prata 925 com Banho de Ouro 18k</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-editorial text-[9px] tracking-[0.2em] text-muted-foreground">Dimensões</h3>
              <p className="text-sm font-light text-foreground">2,5cm x 1,2cm</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-editorial text-[9px] tracking-[0.2em] text-muted-foreground">Peso</h3>
              <p className="text-sm font-light text-foreground">4,2g por brinco</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-editorial text-[9px] tracking-[0.2em] text-muted-foreground">Fecho</h3>
              <p className="text-sm font-light text-foreground">Tarraxa borboleta</p>
            </div>
          </div>
        );

      case "editor_notes":
        return (
          <div key="editor_notes" className="space-y-2">
            <h3 className="text-editorial text-[9px] tracking-[0.2em] text-muted-foreground">Notas do Editor</h3>
            <p className="text-sm font-light text-foreground/80 italic leading-relaxed">
              "Uma interpretação moderna da arquitetura clássica, estes brincos unem elegância atemporal com minimalismo contemporâneo."
            </p>
          </div>
        );

      case "trust_badges":
        return (
          <div key="trust_badges" className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground border border-border/60 px-3 py-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[10px] font-light">Garantia 365 dias</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground border border-border/60 px-3 py-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v11.25M3.375 14.25h17.25" />
              </svg>
              <span className="text-[10px] font-light">Frete grátis</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground border border-border/60 px-3 py-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644V14.652" />
              </svg>
              <span className="text-[10px] font-light">Troca fácil</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {resolvedBlocks
        .filter(b => b.visible)
        .map(b => renderBlock(b.type))}
    </div>
  );
};

export default ProductInfo;
