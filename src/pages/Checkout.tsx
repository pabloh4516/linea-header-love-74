import { useState, useEffect, useMemo } from "react";
import { Minus, Plus, CreditCard, Check, X, Tag, Loader2, Zap } from "lucide-react";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";

type OrderBump = {
  id: string;
  product_id: string;
  bump_product_id: string;
  discount_percentage: number;
  title: string | null;
  description: string | null;
  bump_product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    currency: string;
  };
};

type AppliedCoupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
};

const Checkout = () => {
  const { data: settings } = useSiteSettings();
  const checkout = useMemo(() => ({
    showTrust: settings?.theme_checkout_show_trust !== "false",
    showOrderBumps: settings?.theme_checkout_show_order_bumps !== "false",
    showCoupon: settings?.theme_checkout_show_coupon !== "false",
    trustText: settings?.theme_checkout_trust_text || "Pagamento 100% seguro",
  }), [settings]);

  const shippingOptions = useMemo(() => {
    if (settings?.shipping_options) {
      try {
        const parsed = JSON.parse(settings.shipping_options) as Array<{
          id: string; name: string; price: number; estimatedDays: string; enabled: boolean;
          rules?: Array<{ id: string; type: string; min?: number; max?: number; regions?: string[]; price: number }>;
        }>;
        return parsed.filter(o => o.enabled);
      } catch { /* fallback */ }
    }
    return [
      { id: "standard", name: "Envio Padrão", price: 0, estimatedDays: "5-8 dias úteis", enabled: true, rules: [] as any[] },
      { id: "express", name: "Envio Expresso", price: 25, estimatedDays: "2-3 dias úteis", enabled: true, rules: [] as any[] },
      { id: "overnight", name: "Entrega no Dia Seguinte", price: 60, estimatedDays: "Próximo dia útil", enabled: true, rules: [] as any[] },
    ];
  }, [settings]);

  const freeShippingEnabled = settings?.shipping_free_enabled === "true";
  const freeShippingThreshold = parseFloat(settings?.shipping_free_threshold || "250") || 250;
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  });
  const [hasSeparateBilling, setHasSeparateBilling] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [shippingOption, setShippingOption] = useState("standard");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [acceptedBumps, setAcceptedBumps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBumps = async () => {
      const { data: bumps } = await supabase
        .from("order_bumps")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (!bumps || bumps.length === 0) return;

      const bumpProductIds = bumps.map((b: any) => b.bump_product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, name, price, image_url, currency")
        .in("id", bumpProductIds);

      const productMap = new Map((products || []).map((p: any) => [p.id, p]));
      setOrderBumps(
        bumps.map((b: any) => ({
          ...b,
          bump_product: productMap.get(b.bump_product_id),
        }))
      );
    };
    fetchBumps();
  }, []);

  const toggleBump = (bumpId: string) => {
    setAcceptedBumps(prev => {
      const next = new Set(prev);
      if (next.has(bumpId)) {
        next.delete(bumpId);
        toast.info("Oferta removida");
      } else {
        next.add(bumpId);
        toast.success("Oferta adicionada!");
      }
      return next;
    });
  };

  const getBumpsTotal = () => {
    let total = 0;
    for (const bump of orderBumps) {
      if (acceptedBumps.has(bump.id) && bump.bump_product) {
        const price = bump.bump_product.price;
        const discounted = price * (1 - bump.discount_percentage / 100);
        total += discounted;
      }
    }
    return Math.round(total * 100) / 100;
  };
  
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Anel Pantheon",
      price: "R$2.450",
      quantity: 1,
      image: pantheonImage,
      size: "16 (BR)"
    },
    {
      id: 2,
      name: "Brincos Eclipse", 
      price: "R$1.850",
      quantity: 1,
      image: eclipseImage
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items => 
        items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    return sum + (price * item.quantity);
  }, 0);

  const getShippingCost = () => {
    if (freeShippingEnabled && subtotal >= freeShippingThreshold) return 0;
    const selected = shippingOptions.find(o => o.id === shippingOption);
    if (!selected) return 0;

    // Evaluate rules — first matching rule wins
    const rules = selected.rules || [];
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const customerState = shippingAddress.state?.toUpperCase?.() || "";

    for (const rule of rules) {
      let matches = false;
      switch (rule.type) {
        case "subtotal":
          matches =
            (rule.min == null || subtotal >= rule.min) &&
            (rule.max == null || subtotal <= rule.max);
          break;
        case "quantity":
          matches =
            (rule.min == null || itemCount >= rule.min) &&
            (rule.max == null || itemCount <= rule.max);
          break;
        case "weight":
          // Weight not tracked per-item yet, skip
          break;
        case "region":
          if (customerState && rule.regions?.length) {
            matches = rule.regions.includes(customerState);
          }
          break;
      }
      if (matches) return rule.price;
    }

    return selected.price;
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      return Math.round(subtotal * (appliedCoupon.discount_value / 100) * 100) / 100;
    }
    return Math.min(appliedCoupon.discount_value, subtotal);
  };
  
  const shipping = getShippingCost();
  const discount = getDiscount();
  const bumpsTotal = getBumpsTotal();
  const total = Math.max(0, subtotal + bumpsTotal - discount + shipping);

  const handleApplyCoupon = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const { data, error } = await supabase
        .from("coupons" as any)
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setCouponError("Cupom inválido ou não encontrado");
        setCouponLoading(false);
        return;
      }

      const coupon = data as any;

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setCouponError("Este cupom expirou");
        setCouponLoading(false);
        return;
      }

      // Check start date
      if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
        setCouponError("Este cupom ainda não está ativo");
        setCouponLoading(false);
        return;
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        setCouponError("Este cupom atingiu o limite de usos");
        setCouponLoading(false);
        return;
      }

      // Check minimum purchase
      if (coupon.min_purchase && subtotal < coupon.min_purchase) {
        setCouponError(`Compra mínima de R$${Number(coupon.min_purchase).toFixed(2)} para este cupom`);
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon({
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_purchase: Number(coupon.min_purchase || 0),
      });
      setDiscountCode("");
      setShowDiscountInput(false);
      setCouponError("");
      toast.success(`Cupom ${coupon.code} aplicado!`);
    } catch {
      setCouponError("Erro ao validar cupom");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Cupom removido");
  };

  const handleCustomerDetailsChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingDetailsChange = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDetailsChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Increment coupon used_count
    if (appliedCoupon) {
      await supabase.rpc("increment_coupon_usage" as any, { coupon_id: appliedCoupon.id });
    }

    setIsProcessing(false);
    setPaymentComplete(true);
  };

  const formatBRL = (value: number) => {
    return `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-muted/20 p-8 rounded-none sticky top-6">
                <h2 className="text-lg font-light text-foreground mb-6">Resumo do Pedido</h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-none overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-light text-foreground">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">Tamanho: {item.size}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium text-foreground min-w-[2ch] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-foreground font-medium">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {checkout.showOrderBumps && orderBumps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-muted-foreground/20 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-foreground">Ofertas Especiais</span>
                    </div>
                    {orderBumps.map((bump) => {
                      if (!bump.bump_product) return null;
                      const originalPrice = bump.bump_product.price;
                      const finalPrice = originalPrice * (1 - bump.discount_percentage / 100);
                      const isAccepted = acceptedBumps.has(bump.id);
                      return (
                        <div
                          key={bump.id}
                          onClick={() => toggleBump(bump.id)}
                          className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-all ${
                            isAccepted
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/20 hover:border-muted-foreground/40"
                          }`}
                        >
                          <Checkbox
                            checked={isAccepted}
                            onCheckedChange={() => toggleBump(bump.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {bump.title || `Adicione ${bump.bump_product.name}`}
                            </p>
                            {bump.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{bump.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {bump.discount_percentage > 0 ? (
                                <>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatBRL(originalPrice)}
                                  </span>
                                  <span className="text-sm font-medium text-primary">
                                    {formatBRL(finalPrice)}
                                  </span>
                                  <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium">
                                    -{bump.discount_percentage}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-foreground">
                                  {formatBRL(originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          {bump.bump_product.image_url && (
                            <img
                              src={bump.bump_product.image_url}
                              alt={bump.bump_product.name}
                              className="w-12 h-12 object-cover rounded-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {checkout.showCoupon && (
                <div className="mt-8 pt-6 border-t border-muted-foreground/20">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 px-3 py-2 rounded-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-mono font-medium text-foreground">{appliedCoupon.code}</span>
                        <span className="text-xs text-muted-foreground">
                          ({appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `R$${appliedCoupon.discount_value.toFixed(2)}`})
                        </span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : !showDiscountInput ? (
                    <button 
                      onClick={() => setShowDiscountInput(true)}
                      className="text-sm text-foreground underline hover:no-underline transition-all"
                    >
                      Cupom de desconto
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={discountCode}
                          onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Digite o cupom"
                          className="flex-1 rounded-none font-mono"
                        />
                        <Button 
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !discountCode.trim()}
                          variant="outline"
                          className="rounded-none px-4"
                        >
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                    </div>
                  )}
                </div>
                )}

                {checkout.showTrust && (
                  <div className="mt-4 pt-3 border-t border-muted-foreground/10 flex items-center justify-center gap-2 text-muted-foreground">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-[11px] font-light">{checkout.trustText}</span>
                  </div>
                )}

                <div className="border-t border-muted-foreground/20 mt-4 pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatBRL(subtotal)}</span>
                  </div>
                  {bumpsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ofertas especiais</span>
                      <span className="text-foreground">+{formatBRL(bumpsTotal)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">Desconto</span>
                      <span className="text-primary">-{formatBRL(discount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 lg:order-1 space-y-8">

              <div className="bg-muted/20 p-8 rounded-none">
                <h2 className="text-lg font-light text-foreground mb-6">Dados do Cliente</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-light text-foreground">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => handleCustomerDetailsChange("email", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder="Digite seu e-mail"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-light text-foreground">
                        Nome *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={customerDetails.firstName}
                        onChange={(e) => handleCustomerDetailsChange("firstName", e.target.value)}
                        className="mt-2 rounded-none"
                        placeholder="Nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-light text-foreground">
                        Sobrenome *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={customerDetails.lastName}
                        onChange={(e) => handleCustomerDetailsChange("lastName", e.target.value)}
                        className="mt-2 rounded-none"
                        placeholder="Sobrenome"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-light text-foreground">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => handleCustomerDetailsChange("phone", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                    <h3 className="text-base font-light text-foreground mb-4">Endereço de Entrega</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shippingAddress" className="text-sm font-light text-foreground">
                          Endereço *
                        </Label>
                        <Input
                          id="shippingAddress"
                          type="text"
                          value={shippingAddress.address}
                          onChange={(e) => handleShippingAddressChange("address", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Rua, número, complemento"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shippingCity" className="text-sm font-light text-foreground">
                            Cidade *
                          </Label>
                          <Input
                            id="shippingCity"
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Cidade"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingPostalCode" className="text-sm font-light text-foreground">
                            CEP *
                          </Label>
                          <Input
                            id="shippingPostalCode"
                            type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => handleShippingAddressChange("postalCode", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shippingCountry" className="text-sm font-light text-foreground">
                          Estado *
                        </Label>
                        <Input
                          id="shippingCountry"
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => handleShippingAddressChange("country", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Estado"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="separateBilling"
                        checked={hasSeparateBilling}
                        onCheckedChange={(checked) => setHasSeparateBilling(checked === true)}
                      />
                      <Label 
                        htmlFor="separateBilling" 
                        className="text-sm font-light text-foreground cursor-pointer"
                      >
                        Outro endereço de cobrança
                      </Label>
                    </div>
                  </div>

                  {hasSeparateBilling && (
                    <div className="space-y-6 pt-4">
                      <h3 className="text-base font-light text-foreground">Dados de Cobrança</h3>
                      
                      <div>
                        <Label htmlFor="billingEmail" className="text-sm font-light text-foreground">
                          E-mail *
                        </Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          value={billingDetails.email}
                          onChange={(e) => handleBillingDetailsChange("email", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="E-mail de cobrança"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName" className="text-sm font-light text-foreground">
                            Nome *
                          </Label>
                          <Input
                            id="billingFirstName"
                            type="text"
                            value={billingDetails.firstName}
                            onChange={(e) => handleBillingDetailsChange("firstName", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Nome"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName" className="text-sm font-light text-foreground">
                            Sobrenome *
                          </Label>
                          <Input
                            id="billingLastName"
                            type="text"
                            value={billingDetails.lastName}
                            onChange={(e) => handleBillingDetailsChange("lastName", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Sobrenome"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingPhone" className="text-sm font-light text-foreground">
                          Telefone
                        </Label>
                        <Input
                          id="billingPhone"
                          type="tel"
                          value={billingDetails.phone}
                          onChange={(e) => handleBillingDetailsChange("phone", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Telefone de cobrança"
                        />
                      </div>

                      <div>
                        <Label htmlFor="billingAddress" className="text-sm font-light text-foreground">
                          Endereço *
                        </Label>
                        <Input
                          id="billingAddress"
                          type="text"
                          value={billingDetails.address}
                          onChange={(e) => handleBillingDetailsChange("address", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Rua, número, complemento"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingCity" className="text-sm font-light text-foreground">
                            Cidade *
                          </Label>
                          <Input
                            id="billingCity"
                            type="text"
                            value={billingDetails.city}
                            onChange={(e) => handleBillingDetailsChange("city", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Cidade"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode" className="text-sm font-light text-foreground">
                            CEP *
                          </Label>
                          <Input
                            id="billingPostalCode"
                            type="text"
                            value={billingDetails.postalCode}
                            onChange={(e) => handleBillingDetailsChange("postalCode", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingCountry" className="text-sm font-light text-foreground">
                          Estado *
                        </Label>
                        <Input
                          id="billingCountry"
                          type="text"
                          value={billingDetails.country}
                          onChange={(e) => handleBillingDetailsChange("country", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Estado"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            <div className="bg-muted/20 p-8 rounded-none">
              <h2 className="text-lg font-light text-foreground mb-6">Opções de Envio</h2>
              
              <RadioGroup 
                value={shippingOption} 
                onValueChange={setShippingOption}
                className="space-y-4"
              >
                {shippingOptions.map((opt) => {
                  const isFree = freeShippingEnabled && subtotal >= freeShippingThreshold && opt.price > 0;
                  const displayPrice = opt.price === 0 || isFree
                    ? "Grátis"
                    : `R$${opt.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
                  return (
                    <div key={opt.id} className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={opt.id} id={opt.id} />
                        <Label htmlFor={opt.id} className="font-light text-foreground">
                          {opt.name}
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {displayPrice} • {opt.estimatedDays}
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="bg-muted/20 p-8 rounded-none">
              <h2 className="text-lg font-light text-foreground mb-6">Dados de Pagamento</h2>
              
              {!paymentComplete ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="cardholderName" className="text-sm font-light text-foreground">
                      Nome no Cartão *
                    </Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => handlePaymentDetailsChange("cardholderName", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder="Nome impresso no cartão"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-light text-foreground">
                      Número do Cartão *
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="cardNumber"
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                          if (value.length <= 19) {
                            handlePaymentDetailsChange("cardNumber", value);
                          }
                        }}
                        className="rounded-none pl-10"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-sm font-light text-foreground">
                        Validade *
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={paymentDetails.expiryDate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
                          if (value.length <= 5) {
                            handlePaymentDetailsChange("expiryDate", value);
                          }
                        }}
                        className="mt-2 rounded-none"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm font-light text-foreground">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={paymentDetails.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 3) {
                            handlePaymentDetailsChange("cvv", value);
                          }
                        }}
                        className="mt-2 rounded-none"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/10 p-6 rounded-none border border-muted-foreground/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatBRL(subtotal)}</span>
                    </div>
                    {bumpsTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ofertas especiais</span>
                        <span className="text-foreground">+{formatBRL(bumpsTotal)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary">Desconto ({appliedCoupon?.code})</span>
                        <span className="text-primary">-{formatBRL(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-foreground">
                        {shipping === 0 ? "Grátis" : formatBRL(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-medium border-t border-muted-foreground/20 pt-3">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatBRL(total)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing || !paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName}
                    className="w-full rounded-none h-12 text-base"
                  >
                    {isProcessing ? "Processando..." : `Finalizar Pedido • ${formatBRL(total)}`}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-light text-foreground mb-2">Pedido Concluído!</h3>
                  <p className="text-muted-foreground">Obrigado pela sua compra. A confirmação do pedido foi enviada para o seu e-mail.</p>
                 </div>
               )}
             </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
