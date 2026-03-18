
-- 1. Create page_templates table
CREATE TABLE public.page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL,
  name TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page templates are viewable by everyone"
  ON public.page_templates FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage page templates"
  ON public.page_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_templates_updated_at
  BEFORE UPDATE ON public.page_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX idx_page_templates_default_per_type
  ON public.page_templates (page_type) WHERE is_default = true;

-- 2. Restructure themes table
-- Drop existing RLS policies first
DROP POLICY IF EXISTS "Admins can manage themes" ON public.themes;
DROP POLICY IF EXISTS "Themes are viewable by everyone" ON public.themes;

-- Remove old columns, add new ones
ALTER TABLE public.themes
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS settings_data JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Migrate existing settings data to settings_data
UPDATE public.themes SET settings_data = settings WHERE settings IS NOT NULL AND settings != '{}'::jsonb;
UPDATE public.themes SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;

-- Now make slug NOT NULL and UNIQUE
ALTER TABLE public.themes ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.themes ADD CONSTRAINT themes_slug_unique UNIQUE (slug);

-- Drop old columns
ALTER TABLE public.themes
  DROP COLUMN IF EXISTS is_preset,
  DROP COLUMN IF EXISTS preview_colors,
  DROP COLUMN IF EXISTS settings;

-- Recreate RLS policies
CREATE POLICY "Themes are viewable by everyone"
  ON public.themes FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage themes"
  ON public.themes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger (if not already)
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Unique index: only one active theme
CREATE UNIQUE INDEX idx_themes_single_active
  ON public.themes (is_active) WHERE is_active = true;

-- 3. Seed default theme (upsert)
INSERT INTO public.themes (slug, name, is_active, settings_data)
VALUES ('linea-minimal', 'Linea Minimal', true, '{}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET is_active = true;
