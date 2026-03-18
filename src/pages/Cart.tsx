import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";

const Cart = () => {
  const { theme } = useThemeConfig();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Anel Pantheon",
      price: "R$2.450",
      quantity: 1,
      image: pantheonImage,
      size: "16 (BR)",
      category: "Anéis",
    },
    {
      id: 2,
      name: "Brincos Eclipse",
      price: "R$1.850",
      quantity: 1,
      image: eclipseImage,
      category: "Brincos",
    },
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((items) => items.filter((item) => item.id !== id));
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(
      item.price.replace("R$", "").replace(/\./g, "").replace(",", ".")
    );
    return sum + price * item.quantity;
  }, 0);

  const formatBRL = (value: number) =>
    `R$${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const btnStyle: React.CSSProperties = {
    borderRadius: `${theme.buttonRadius}px`,
    height: `${theme.buttonHeight}px`,
    fontSize: `${theme.buttonFontSize}px`,
    letterSpacing: `${theme.buttonLetterSpacing}em`,
    fontWeight: Number(theme.buttonFontWeight),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-theme-section="cart">
      <Header />

      <main className="flex-1 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </Link>

          <h1 className="text-2xl font-light text-foreground mb-8">
            Sacola de Compras
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mx-auto" />
              <div>
                <p className="text-lg font-light text-foreground mb-2">
                  Sua sacola está vazia
                </p>
                <p className="text-sm text-muted-foreground">
                  Continue comprando para adicionar itens à sua sacola.
                </p>
              </div>
              <Button asChild style={btnStyle}>
                <Link to="/category/shop">Ver Produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-0 divide-y divide-border">
                {/* Table header (desktop) */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-4 text-xs text-muted-foreground uppercase tracking-wider">
                  <span>Produto</span>
                  <span className="text-center">Quantidade</span>
                  <span className="text-right">Total</span>
                  <span className="w-10" />
                </div>

                {cartItems.map((item) => {
                  const price = parseFloat(
                    item.price
                      .replace("R$", "")
                      .replace(/\./g, "")
                      .replace(",", ".")
                  );
                  return (
                    <div
                      key={item.id}
                      className="py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center"
                    >
                      {/* Product info */}
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted/10 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                          </p>
                          <h3 className="text-sm font-medium text-foreground">
                            {item.name}
                          </h3>
                          {item.size && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tamanho: {item.size}
                            </p>
                          )}
                          <p className="text-sm text-foreground mt-1 md:hidden">
                            {item.price}
                          </p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-2 text-sm font-light min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <p className="text-sm font-medium text-foreground text-right hidden md:block">
                        {formatBRL(price * item.quantity)}
                      </p>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors justify-self-end"
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Summary sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-muted/20 p-6 space-y-6 sticky top-6">
                  <h2 className="text-lg font-light text-foreground">
                    Resumo
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-medium">
                        {formatBRL(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-muted-foreground text-xs">
                        Calculado no checkout
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between text-foreground">
                    <span className="font-medium">Total estimado</span>
                    <span className="font-medium">{formatBRL(subtotal)}</span>
                  </div>

                  <Button
                    asChild
                    className="w-full"
                    size="lg"
                    style={btnStyle}
                  >
                    <Link to="/checkout">Finalizar Compra</Link>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="w-full"
                    size="lg"
                    style={btnStyle}
                  >
                    <Link to="/category/shop">Continuar Comprando</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
