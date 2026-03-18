ALTER TABLE public.homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;
ALTER TABLE public.homepage_sections ADD CONSTRAINT homepage_sections_section_type_check CHECK (
  section_type = ANY (ARRAY[
    'hero'::text, 'large_hero'::text, 'asymmetric_grid'::text, 'fifty_fifty'::text,
    'one_third_two_thirds'::text, 'product_carousel'::text, 'editorial'::text,
    'full_width_banner'::text, 'story'::text, 'carousel'::text,
    'rich_text'::text, 'newsletter'::text, 'slideshow'::text, 'testimonials'::text,
    'video'::text, 'multicolumn'::text, 'collapsible_content'::text,
    'contact_form'::text, 'image_gallery'::text, 'separator'::text,
    'featured_product'::text, 'collection_list'::text, 'logo_list'::text,
    'countdown'::text, 'marquee'::text
  ])
);