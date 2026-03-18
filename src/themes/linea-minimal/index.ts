import { themeRegistry } from "@/theme-engine";
import type { SectionSchema, ThemeRegistration } from "@/theme-engine";

// Import all section components
import ImmersiveHero from "@/components/content/ImmersiveHero";
import AsymmetricGrid from "@/components/content/AsymmetricGrid";
import ProductCarousel from "@/components/content/ProductCarousel";
import FullWidthBanner from "@/components/content/FullWidthBanner";
import StorySection from "@/components/content/StorySection";
import FiftyFiftySection from "@/components/content/FiftyFiftySection";
import OneThirdTwoThirdsSection from "@/components/content/OneThirdTwoThirdsSection";
import EditorialSection from "@/components/content/EditorialSection";
import LargeHero from "@/components/content/LargeHero";
import RichTextSection from "@/components/content/RichTextSection";
import NewsletterSection from "@/components/content/NewsletterSection";
import SlideshowSection from "@/components/content/SlideshowSection";
import TestimonialsSection from "@/components/content/TestimonialsSection";
import VideoSection from "@/components/content/VideoSection";
import MultiColumnSection from "@/components/content/MultiColumnSection";
import CollapsibleContentSection from "@/components/content/CollapsibleContentSection";
import ContactFormSection from "@/components/content/ContactFormSection";
import ImageGallerySection from "@/components/content/ImageGallerySection";
import SeparatorSection from "@/components/content/SeparatorSection";
import FeaturedProductSection from "@/components/content/FeaturedProductSection";
import CollectionListSection from "@/components/content/CollectionListSection";
import LogoListSection from "@/components/content/LogoListSection";
import CountdownSection from "@/components/content/CountdownSection";
import MarqueeSection from "@/components/content/MarqueeSection";

// ═══════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH — All section schemas
// ═══════════════════════════════════════════════════════════

const schemas: Record<string, SectionSchema> = {
  hero: {
    name: "Hero Imersivo",
    icon: "ImageIcon",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Herança\nModerna" },
      { type: "text", id: "subtitle", label: "Subtítulo", default: "Nova Coleção 2026" },
      { type: "text", id: "cta_text", label: "Texto do CTA", default: "Explorar Coleção" },
      { type: "url", id: "link_url", label: "Link do CTA", default: "/category/shop" },
      { type: "image", id: "image_url", label: "Imagem de Fundo" },
      { type: "select", id: "height", label: "Altura", default: "full", options: [
        { value: "full", label: "Tela Inteira" },
        { value: "large", label: "Grande (85vh)" },
        { value: "medium", label: "Média (70vh)" },
      ]},
    ],
    blocks: [{
      type: "button",
      name: "Botão CTA",
      limit: 3,
      settings: [
        { type: "text", id: "text", label: "Texto do Botão" },
        { type: "url", id: "link", label: "Link" },
        { type: "select", id: "style", label: "Estilo", default: "primary", options: [
          { value: "primary", label: "Principal" },
          { value: "outline", label: "Contorno" },
          { value: "text", label: "Texto" },
        ]},
      ],
    }],
  },

  large_hero: {
    name: "Hero Grande",
    icon: "ImageIcon",
    settings: [
      { type: "text", id: "title", label: "Título", default: "Herança Moderna" },
      { type: "text", id: "subtitle", label: "Subtítulo", default: "Joias contemporâneas criadas com elegância atemporal" },
      { type: "image", id: "image_url", label: "Imagem" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
      { type: "checkbox", id: "show_overlay", label: "Mostrar Overlay", default: false },
    ],
  },

  slideshow: {
    name: "Slideshow",
    icon: "Layers",
    settings: [
      { type: "range", id: "autoplay_speed", label: "Velocidade do Autoplay", default: 5000, min: 1000, max: 10000, step: 500, unit: "ms" },
      { type: "checkbox", id: "show_arrows", label: "Mostrar Setas", default: true },
      { type: "checkbox", id: "show_dots", label: "Mostrar Indicadores", default: true },
      { type: "select", id: "slide_height", label: "Altura dos Slides", default: "100vh", options: [
        { value: "100vh", label: "Tela Inteira" },
        { value: "85vh", label: "Grande" },
        { value: "70vh", label: "Média" },
        { value: "50vh", label: "Pequena" },
      ]},
    ],
    blocks: [{
      type: "slide",
      name: "Slide",
      limit: 8,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "heading", label: "Título" },
        { type: "text", id: "subheading", label: "Subtítulo" },
        { type: "text", id: "button_text", label: "Texto do Botão" },
        { type: "url", id: "button_link", label: "Link do Botão" },
        { type: "select", id: "text_position", label: "Posição do Texto", default: "center", options: [
          { value: "left", label: "Esquerda" },
          { value: "center", label: "Centro" },
          { value: "right", label: "Direita" },
        ]},
      ],
    }],
  },

  asymmetric_grid: {
    name: "Grid Assimétrico",
    icon: "LayoutGrid",
    settings: [
      { type: "text", id: "title", label: "Título da Seção" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
    ],
    blocks: [{
      type: "card",
      name: "Card do Grid",
      limit: 5,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "title", label: "Título" },
        { type: "text", id: "subtitle", label: "Subtítulo" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  fifty_fifty: {
    name: "50/50",
    icon: "Columns",
    settings: [],
    blocks: [{
      type: "item",
      name: "Item",
      limit: 2,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "title", label: "Título" },
        { type: "text", id: "subtitle", label: "Descrição" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  one_third_two_thirds: {
    name: "1/3 + 2/3",
    icon: "Columns",
    settings: [],
    blocks: [{
      type: "item",
      name: "Item",
      limit: 2,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "title", label: "Título" },
        { type: "text", id: "subtitle", label: "Descrição" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  product_carousel: {
    name: "Carrossel de Produtos",
    icon: "ShoppingBag",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
    ],
  },

  editorial: {
    name: "Editorial",
    icon: "FileText",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
      { type: "image", id: "image_url", label: "Imagem" },
      { type: "select", id: "image_position", label: "Posição da Imagem", default: "right", options: [
        { value: "left", label: "Esquerda" },
        { value: "right", label: "Direita" },
      ]},
    ],
  },

  full_width_banner: {
    name: "Banner Full Width",
    icon: "ImageIcon",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
      { type: "image", id: "image_url", label: "Imagem de Fundo" },
    ],
    blocks: [{
      type: "button",
      name: "Botão CTA",
      limit: 3,
      settings: [
        { type: "text", id: "text", label: "Texto do Botão" },
        { type: "url", id: "link", label: "Link" },
        { type: "select", id: "style", label: "Estilo", default: "primary", options: [
          { value: "primary", label: "Principal" },
          { value: "outline", label: "Contorno" },
          { value: "text", label: "Texto" },
        ]},
      ],
    }],
  },

  story: {
    name: "Nossa História",
    icon: "FileText",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
      { type: "image", id: "image_url", label: "Imagem" },
    ],
    blocks: [{
      type: "stat",
      name: "Estatística",
      limit: 4,
      settings: [
        { type: "text", id: "number", label: "Número" },
        { type: "text", id: "label", label: "Descrição" },
      ],
    }],
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
      { type: "range", id: "padding", label: "Espaçamento", default: 80, min: 0, max: 200, step: 8, unit: "px" },
    ],
  },

  newsletter: {
    name: "Newsletter",
    icon: "Mail",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto do Botão" },
      { type: "checkbox", id: "full_width", label: "Largura Total", default: false },
    ],
  },

  testimonials: {
    name: "Depoimentos",
    icon: "Star",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
    ],
    blocks: [{
      type: "testimonial",
      name: "Depoimento",
      limit: 6,
      settings: [
        { type: "text", id: "author", label: "Autor" },
        { type: "textarea", id: "quote", label: "Depoimento" },
        { type: "range", id: "rating", label: "Nota", default: 5, min: 1, max: 5, step: 1 },
        { type: "text", id: "location", label: "Localização" },
      ],
    }],
  },

  video: {
    name: "Vídeo",
    icon: "Video",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "description", label: "Descrição" },
      { type: "video_url", id: "video_url", label: "URL do Vídeo", placeholder: "https://youtube.com/watch?v=..." },
      { type: "image", id: "image_url", label: "Imagem de Capa" },
      { type: "select", id: "aspect", label: "Proporção", default: "16/9", options: [
        { value: "16/9", label: "16:9 (Widescreen)" },
        { value: "4/3", label: "4:3" },
        { value: "1/1", label: "1:1 (Quadrado)" },
        { value: "21/9", label: "21:9 (Ultrawide)" },
      ]},
    ],
  },

  multicolumn: {
    name: "Multi-Colunas",
    icon: "LayoutGrid",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "select", id: "columns", label: "Colunas", default: "3", options: [
        { value: "2", label: "2 Colunas" },
        { value: "3", label: "3 Colunas" },
        { value: "4", label: "4 Colunas" },
      ]},
      { type: "select", id: "alignment", label: "Alinhamento", default: "center", options: [
        { value: "center", label: "Centro" },
        { value: "left", label: "Esquerda" },
      ]},
    ],
    blocks: [{
      type: "column",
      name: "Coluna",
      limit: 4,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "title", label: "Título" },
        { type: "textarea", id: "description", label: "Descrição" },
        { type: "text", id: "button_text", label: "Texto do Botão" },
        { type: "url", id: "button_link", label: "Link" },
      ],
    }],
  },

  collapsible_content: {
    name: "FAQ / Acordeão",
    icon: "HelpCircle",
    settings: [
      { type: "text", id: "title", label: "Título da Seção" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "select", id: "layout", label: "Layout", default: "full", options: [
        { value: "full", label: "Largura Total" },
        { value: "side-by-side", label: "Lado a Lado" },
      ]},
    ],
    blocks: [{
      type: "question",
      name: "Pergunta",
      limit: 20,
      settings: [
        { type: "text", id: "question", label: "Pergunta" },
        { type: "textarea", id: "answer", label: "Resposta" },
      ],
    }],
  },

  contact_form: {
    name: "Formulário de Contato",
    icon: "MessageSquare",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "textarea", id: "description", label: "Descrição" },
      { type: "text", id: "cta_text", label: "Texto do Botão", default: "Enviar" },
      { type: "image", id: "image_url", label: "Imagem" },
    ],
  },

  image_gallery: {
    name: "Galeria de Imagens",
    icon: "ImageIcon",
    settings: [
      { type: "text", id: "title", label: "Título da Seção" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "select", id: "layout", label: "Layout", default: "grid", options: [
        { value: "grid", label: "Grid" },
        { value: "masonry", label: "Masonry" },
      ]},
      { type: "select", id: "columns", label: "Colunas", default: "3", options: [
        { value: "2", label: "2 Colunas" },
        { value: "3", label: "3 Colunas" },
        { value: "4", label: "4 Colunas" },
      ]},
    ],
    blocks: [{
      type: "image",
      name: "Imagem",
      limit: 12,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "caption", label: "Legenda" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  separator: {
    name: "Separador",
    icon: "SeparatorHorizontal",
    settings: [
      { type: "range", id: "padding_top", label: "Espaço Superior", default: 40, min: 0, max: 120, step: 4, unit: "px" },
      { type: "range", id: "padding_bottom", label: "Espaço Inferior", default: 40, min: 0, max: 120, step: 4, unit: "px" },
      { type: "checkbox", id: "show_line", label: "Mostrar Linha", default: true },
    ],
  },

  // ─── Product page sections ────────────────────────────────
  product_info: {
    name: "Informações do Produto",
    icon: "ShoppingBag",
    settings: [],
  },

  product_gallery: {
    name: "Galeria do Produto",
    icon: "ImageIcon",
    settings: [
      { type: "text", id: "title", label: "Título" },
    ],
  },

  product_recommendations: {
    name: "Produtos Recomendados",
    icon: "Star",
    settings: [
      { type: "text", id: "title", label: "Título da Seção" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "text", id: "cta_text", label: "Texto do CTA" },
      { type: "url", id: "link_url", label: "Link do CTA" },
    ],
  },

  // ─── 5 New sections ───────────────────────────────────────
  featured_product: {
    name: "Produto em Destaque",
    icon: "Star",
    settings: [
      { type: "text", id: "title", label: "Título da Seção" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "image", id: "image_url", label: "Imagem do Produto" },
      { type: "text", id: "product_name", label: "Nome do Produto" },
      { type: "textarea", id: "description", label: "Descrição do Produto" },
      { type: "text", id: "price", label: "Preço (ex: R$ 1.290)" },
      { type: "text", id: "cta_text", label: "Texto do Botão", default: "Comprar Agora" },
      { type: "url", id: "link_url", label: "Link do Produto" },
      { type: "select", id: "image_position", label: "Posição da Imagem", default: "left", options: [
        { value: "left", label: "Esquerda" },
        { value: "right", label: "Direita" },
      ]},
      { type: "checkbox", id: "show_price", label: "Mostrar Preço", default: true },
      { type: "checkbox", id: "show_description", label: "Mostrar Descrição", default: true },
    ],
  },

  collection_list: {
    name: "Lista de Coleções",
    icon: "LayoutGrid",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "select", id: "columns", label: "Colunas", default: "3", options: [
        { value: "2", label: "2 Colunas" },
        { value: "3", label: "3 Colunas" },
        { value: "4", label: "4 Colunas" },
      ]},
    ],
    blocks: [{
      type: "collection",
      name: "Coleção",
      limit: 8,
      settings: [
        { type: "image", id: "image", label: "Imagem" },
        { type: "text", id: "title", label: "Título" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  logo_list: {
    name: "Lista de Logos",
    icon: "Globe",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
    ],
    blocks: [{
      type: "logo",
      name: "Logo",
      limit: 12,
      settings: [
        { type: "image", id: "image", label: "Logo" },
        { type: "text", id: "alt_text", label: "Texto Alternativo" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },

  countdown: {
    name: "Contagem Regressiva",
    icon: "Clock",
    settings: [
      { type: "text", id: "title", label: "Título" },
      { type: "text", id: "subtitle", label: "Subtítulo" },
      { type: "text", id: "end_date", label: "Data Final (ISO)", placeholder: "2026-12-31T23:59:59" },
      { type: "text", id: "cta_text", label: "Texto do Botão" },
      { type: "url", id: "link_url", label: "Link do Botão" },
      { type: "text", id: "expired_message", label: "Mensagem de Expirado", default: "Evento encerrado" },
      { type: "checkbox", id: "show_days", label: "Mostrar Dias", default: true },
      { type: "checkbox", id: "show_hours", label: "Mostrar Horas", default: true },
      { type: "checkbox", id: "show_minutes", label: "Mostrar Minutos", default: true },
      { type: "checkbox", id: "show_seconds", label: "Mostrar Segundos", default: true },
      { type: "image", id: "image_url", label: "Imagem de Fundo" },
    ],
  },

  marquee: {
    name: "Texto Deslizante",
    icon: "ArrowRight",
    settings: [
      { type: "range", id: "speed", label: "Velocidade", default: 30, min: 5, max: 100, step: 1, unit: "s" },
      { type: "checkbox", id: "pause_on_hover", label: "Pausar ao Passar o Mouse", default: true },
      { type: "select", id: "size", label: "Tamanho do Texto", default: "md", options: [
        { value: "sm", label: "Pequeno" },
        { value: "md", label: "Médio" },
        { value: "lg", label: "Grande" },
        { value: "xl", label: "Extra Grande" },
      ]},
    ],
    blocks: [{
      type: "text",
      name: "Texto",
      limit: 10,
      settings: [
        { type: "text", id: "content", label: "Conteúdo" },
        { type: "url", id: "link", label: "Link" },
      ],
    }],
  },
};

// ═══════════════════════════════════════════════════════════
// Theme Registration
// ═══════════════════════════════════════════════════════════

const lineaMinimal: ThemeRegistration = {
  id: "linea-minimal",
  name: "Linea Minimal",
  description: "Clean, espaçoso, tipografia leve. Perfeito para joias e moda.",
  author: "Linea",
  version: "1.0.0",
  sections: {
    hero: { component: ImmersiveHero, schema: schemas.hero },
    large_hero: { component: LargeHero, schema: schemas.large_hero },
    slideshow: { component: SlideshowSection, schema: schemas.slideshow },
    asymmetric_grid: { component: AsymmetricGrid, schema: schemas.asymmetric_grid },
    fifty_fifty: { component: FiftyFiftySection, schema: schemas.fifty_fifty },
    one_third_two_thirds: { component: OneThirdTwoThirdsSection, schema: schemas.one_third_two_thirds },
    product_carousel: { component: ProductCarousel, schema: schemas.product_carousel },
    editorial: { component: EditorialSection, schema: schemas.editorial },
    full_width_banner: { component: FullWidthBanner, schema: schemas.full_width_banner },
    story: { component: StorySection, schema: schemas.story },
    rich_text: { component: RichTextSection, schema: schemas.rich_text },
    newsletter: { component: NewsletterSection, schema: schemas.newsletter },
    testimonials: { component: TestimonialsSection, schema: schemas.testimonials },
    video: { component: VideoSection, schema: schemas.video },
    multicolumn: { component: MultiColumnSection, schema: schemas.multicolumn },
    collapsible_content: { component: CollapsibleContentSection, schema: schemas.collapsible_content },
    contact_form: { component: ContactFormSection, schema: schemas.contact_form },
    image_gallery: { component: ImageGallerySection, schema: schemas.image_gallery },
    separator: { component: SeparatorSection, schema: schemas.separator },
    product_info: { component: () => null, schema: schemas.product_info },
    product_gallery: { component: () => null, schema: schemas.product_gallery },
    product_recommendations: { component: ProductCarousel, schema: schemas.product_recommendations },
    featured_product: { component: FeaturedProductSection, schema: schemas.featured_product },
    collection_list: { component: CollectionListSection, schema: schemas.collection_list },
    logo_list: { component: LogoListSection, schema: schemas.logo_list },
    countdown: { component: CountdownSection, schema: schemas.countdown },
    marquee: { component: MarqueeSection, schema: schemas.marquee },
  },
  globalSettingsSchema: [],
  defaultSettings: {},
  templates: {
    index: { name: "Página Inicial", defaultSections: ["hero", "asymmetric_grid", "product_carousel", "full_width_banner", "story"] },
    product: { name: "Página de Produto", defaultSections: ["product_gallery", "product_info", "product_recommendations"] },
    collection: { name: "Página de Categoria", defaultSections: ["rich_text", "product_carousel"] },
  },
};

themeRegistry.register(lineaMinimal);

export default lineaMinimal;
