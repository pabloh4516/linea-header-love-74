ALTER TABLE public.homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;
ALTER TABLE public.homepage_sections ADD CONSTRAINT homepage_sections_section_type_check 
  CHECK (section_type IN ('hero', 'large_hero', 'asymmetric_grid', 'fifty_fifty', 'one_third_two_thirds', 'product_carousel', 'editorial', 'full_width_banner', 'story', 'carousel'));