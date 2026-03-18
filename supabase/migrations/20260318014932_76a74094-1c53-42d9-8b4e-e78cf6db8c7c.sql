
-- Add stock and sale price fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_price numeric,
  ADD COLUMN IF NOT EXISTS sale_starts_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamp with time zone;

-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value numeric NOT NULL DEFAULT 0,
  min_purchase numeric DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coupons are readable by everyone" ON public.coupons
  FOR SELECT TO public
  USING (true);

-- Order bumps table
CREATE TABLE public.order_bumps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  bump_product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  discount_percentage numeric NOT NULL DEFAULT 0,
  title text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order bumps" ON public.order_bumps
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Order bumps are readable by everyone" ON public.order_bumps
  FOR SELECT TO public
  USING (true);

-- Pages table (for policy pages and custom pages)
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text,
  page_type text NOT NULL DEFAULT 'custom', -- 'policy', 'custom'
  is_published boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pages" ON public.pages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Published pages are readable by everyone" ON public.pages
  FOR SELECT TO public
  USING (is_published = true);

-- Seed default policy pages
INSERT INTO public.pages (slug, title, content, page_type, is_published) VALUES
  ('privacy-policy', 'Política de Privacidade', '', 'policy', true),
  ('terms-of-service', 'Termos de Serviço', '', 'policy', true),
  ('return-policy', 'Política de Troca e Devolução', '', 'policy', false),
  ('shipping-policy', 'Política de Envio', '', 'policy', false);
