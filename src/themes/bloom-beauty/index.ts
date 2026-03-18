import { themeRegistry } from "@/theme-engine";
import type { SectionSchema, ThemeRegistration } from "@/theme-engine/types";

// ═══════════════════════════════════════════════════════════
// Components — 100% unique, não compartilhados com outros temas
// ═══════════════════════════════════════════════════════════
import BloomHero from "./components/BloomHero";
import BloomProductShowcase from "./components/BloomProductShowcase";
import BloomStory from "./components/BloomStory";
import BloomIngredients from "./components/BloomIngredients";
import BloomTestimonials from "./components/BloomTestimonials";
import BloomNewsletter from "./components/BloomNewsletter";
import BloomRichText from "./components/BloomRichText";
import BloomBanner from "./components/BloomBanner";
import BloomFiftyFifty from "./components/BloomFiftyFifty";

// ═══════════════════════════════════════════════════════════
// Section Schemas
// ═══════════════════════════════════════════════════════════

const schemas: Record<string, SectionSchema> = {
  hero: {
    name: "Hero",
    icon: "Sparkles",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Sua pele merece rituais, não rotinas." },
      { type: "text", id: "subtitle", label: "Subtítulo", default: "Ingredientes puros. Ciência consciente." },
      { type: "text", id: "cta_text", label: "Texto do botão", default: "Explorar" },
      { type: "url", id: "link_url", label: "Link", default: "/category/skincare" },
      { type: "image", id: "image_url", label: "Imagem" },
      { type: "select", id: "layout", label: "Layout", default: "split", options: [
        { value: "split", label: "Dividido" },
        { value: "full", label: "Tela cheia" },
      ]},
    ],
  },

  product_carousel: {
    name: "Vitrine de Produtos",
    icon: "ShoppingBag",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Rituais" },
      { type: "text", id: "subtitle", label: "Subtítulo", default: "Produtos pensados para cada etapa" },
      { type: "text", id: "cta_text", label: "Texto CTA", default: "Ver todos" },
      { type: "url", id: "link_url", label: "Link CTA", default: "/category/all" },
    ],
  },

  story: {
    name: "História da Marca",
    icon: "BookOpen",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Da terra à pele" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto CTA", default: "Nossa história" },
      { type: "url", id: "link_url", label: "Link CTA", default: "/about/our-story" },
      { type: "image", id: "image_url", label: "Imagem" },
    ],
  },

  multicolumn: {
    name: "Ingredientes",
    icon: "Leaf",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Ingredientes com propósito" },
      { type: "text", id: "subtitle", label: "Subtítulo", default: "Cada fórmula é um ritual consciente" },
    ],
    blocks: [{
      type: "ingredient",
      name: "Ingrediente",
      limit: 8,
      settings: [
        { type: "text", id: "title", label: "Nome", default: "Ingrediente" },
        { type: "textarea", id: "description", label: "Descrição" },
        { type: "image", id: "image", label: "Imagem (opcional)" },
      ],
    }],
  },

  testimonials: {
    name: "Depoimentos",
    icon: "Quote",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Quem usa, sente" },
    ],
    blocks: [{
      type: "review",
      name: "Depoimento",
      limit: 6,
      settings: [
        { type: "text", id: "name", label: "Nome" },
        { type: "textarea", id: "text", label: "Texto" },
        { type: "text", id: "product", label: "Produto" },
      ],
    }],
  },

  newsletter: {
    name: "Newsletter",
    icon: "Mail",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Faça parte do ritual" },
      { type: "textarea", id: "description", label: "Descrição" },
    ],
  },

  rich_text: {
    name: "Texto Rico",
    icon: "Type",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "textarea", id: "description", label: "Conteúdo" },
      { type: "select", id: "alignment", label: "Alinhamento", default: "center", options: [
        { value: "center", label: "Centro" },
        { value: "left", label: "Esquerda" },
      ]},
      { type: "select", id: "size", label: "Tamanho", default: "normal", options: [
        { value: "normal", label: "Normal" },
        { value: "large", label: "Grande" },
      ]},
    ],
  },

  full_width_banner: {
    name: "Banner Parallax",
    icon: "Image",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Menos é mais." },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto CTA", default: "Conheça" },
      { type: "url", id: "link_url", label: "Link CTA" },
      { type: "image", id: "image_url", label: "Imagem de fundo" },
    ],
  },

  fifty_fifty: {
    name: "50/50 Split",
    icon: "Columns",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Rotina simplificada" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto CTA", default: "Descobrir" },
      { type: "url", id: "link_url", label: "Link CTA" },
      { type: "image", id: "image_url", label: "Imagem" },
      { type: "checkbox", id: "reverse", label: "Inverter lados", default: false },
    ],
  },

  // Placeholder sections for product pages
  product_info: {
    name: "Informações do Produto",
    icon: "Info",
    settings: [],
    blocks: [{
      type: "block",
      name: "Bloco",
      settings: [
        { type: "select", id: "type", label: "Tipo", options: [
          { value: "breadcrumb", label: "Breadcrumb" },
          { value: "title", label: "Título" },
          { value: "price", label: "Preço" },
          { value: "quantity", label: "Quantidade" },
          { value: "add_to_cart", label: "Adicionar ao carrinho" },
          { value: "description", label: "Descrição" },
        ]},
        { type: "checkbox", id: "visible", label: "Visível", default: true },
      ],
    }],
  },

  product_gallery: {
    name: "Galeria de Produto",
    icon: "GalleryHorizontal",
    settings: [
      { type: "select", id: "style", label: "Estilo", default: "grid", options: [
        { value: "grid", label: "Grid" },
        { value: "thumbnails", label: "Thumbnails" },
      ]},
    ],
  },

  product_recommendations: {
    name: "Recomendações",
    icon: "Sparkles",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Combine com" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// Theme Registration
// ═══════════════════════════════════════════════════════════

const bloomBeauty: ThemeRegistration = {
  id: "bloom-beauty",
  name: "Bloom Beauty",
  description: "Editorial de beleza com estética orgânica, scroll imersivo e tipografia sofisticada. Ideal para skincare e cosméticos.",
  author: "Linea",
  version: "1.0.0",
  sections: {
    hero: { component: BloomHero, schema: schemas.hero },
    product_carousel: { component: BloomProductShowcase, schema: schemas.product_carousel },
    story: { component: BloomStory, schema: schemas.story },
    multicolumn: { component: BloomIngredients, schema: schemas.multicolumn },
    testimonials: { component: BloomTestimonials, schema: schemas.testimonials },
    newsletter: { component: BloomNewsletter, schema: schemas.newsletter },
    rich_text: { component: BloomRichText, schema: schemas.rich_text },
    full_width_banner: { component: BloomBanner, schema: schemas.full_width_banner },
    fifty_fifty: { component: BloomFiftyFifty, schema: schemas.fifty_fifty },
    product_info: { component: () => null, schema: schemas.product_info },
    product_gallery: { component: () => null, schema: schemas.product_gallery },
    product_recommendations: { component: BloomProductShowcase, schema: schemas.product_recommendations },
  },
  globalSettingsSchema: [],
  defaultSettings: {},
  templates: {
    index: {
      name: "Página Inicial",
      defaultSections: ["hero", "product_carousel", "multicolumn", "full_width_banner", "story", "testimonials", "newsletter"],
    },
    product: {
      name: "Página de Produto",
      defaultSections: ["product_gallery", "product_info", "product_recommendations"],
    },
    collection: {
      name: "Página de Categoria",
      defaultSections: ["rich_text", "product_carousel"],
    },
  },
};

themeRegistry.register(bloomBeauty);

export default bloomBeauty;
