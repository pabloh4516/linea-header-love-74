import { useState, useRef, useCallback, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { useHomepageSections, useUpdateSection, useCreateSection, useDeleteSection } from "@/hooks/useHomepageSections";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Save, Monitor, Smartphone, Tablet, RotateCcw, Palette, Type, Layout, Square,
  ChevronLeft, ChevronRight, Minus, Image as ImageIcon, ShoppingBag, CreditCard,
  Globe, Menu, AlignCenter, Layers, Eye, EyeOff, ArrowUp, Megaphone, Grid3X3, Search,
  Share2, Code, MousePointer, Sparkles, Home, Plus, Trash2, GripVertical, ArrowLeft,
  ChevronDown, ChevronUp, FileText, Video, MessageSquare, Mail, Columns, HelpCircle,
  SeparatorHorizontal, Star, LayoutGrid,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Json } from "@/integrations/supabase/types";

// ─── Font Options ──────────────────────────────────────────
const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans" },
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lora", label: "Lora" },
  { value: "Raleway", label: "Raleway" },
  { value: "Libre Baskerville", label: "Libre Baskerville" },
  { value: "Poppins", label: "Poppins" },
  { value: "Source Serif 4", label: "Source Serif 4" },
  { value: "EB Garamond", label: "EB Garamond" },
  { value: "Josefin Sans", label: "Josefin Sans" },
];

// ─── All theme keys with defaults ──────────────────────────
const DEFAULTS: Record<string, string> = {
  // Colors
  theme_primary_h: "30", theme_primary_s: "5", theme_primary_l: "8",
  theme_bg_h: "30", theme_bg_s: "10", theme_bg_l: "98",
  theme_fg_h: "30", theme_fg_s: "5", theme_fg_l: "8",
  theme_accent_h: "35", theme_accent_s: "30", theme_accent_l: "90",
  theme_muted_h: "30", theme_muted_s: "8", theme_muted_l: "95",
  theme_border_h: "30", theme_border_s: "8", theme_border_l: "88",
  theme_destructive_h: "0", theme_destructive_s: "84", theme_destructive_l: "60",
  // Typography
  theme_font_display: "DM Sans",
  theme_font_body: "DM Sans",
  theme_font_size_base: "16",
  theme_heading_weight: "300",
  theme_body_weight: "300",
  theme_letter_spacing_editorial: "0.05",
  // Layout
  theme_border_radius: "0.375",
  theme_spacing_section: "96",
  theme_max_width: "1440",
  // Buttons
  theme_button_style: "solid",
  theme_button_radius: "0",
  theme_button_height: "52",
  theme_button_font_size: "12",
  theme_button_letter_spacing: "0.15",
  theme_button_font_weight: "300",
  // Announcement / Status Bar
  theme_statusbar_bg_h: "30", theme_statusbar_bg_s: "5", theme_statusbar_bg_l: "8",
  theme_statusbar_fg_h: "30", theme_statusbar_fg_s: "10", theme_statusbar_fg_l: "98",
  theme_statusbar_visible: "true",
  theme_statusbar_height: "36",
  theme_statusbar_font_size: "10",
  theme_statusbar_text_1: "Frete grátis acima de R$250",
  theme_statusbar_text_2: "Garantia de 365 dias",
  theme_statusbar_text_3: "+100.000 clientes satisfeitos",
  theme_statusbar_rotation_speed: "3000",
  // Header / Navigation
  theme_nav_bg_h: "30", theme_nav_bg_s: "10", theme_nav_bg_l: "98",
  theme_nav_fg_h: "30", theme_nav_fg_s: "5", theme_nav_fg_l: "20",
  theme_nav_height: "64",
  theme_nav_logo_height: "24",
  theme_nav_style: "centered",
  theme_nav_sticky: "true",
  theme_nav_transparent_hero: "false",
  theme_nav_show_search: "true",
  theme_nav_show_wishlist: "true",
  // Product Card
  theme_card_aspect: "3/4",
  theme_card_hover_effect: "zoom",
  theme_card_show_category: "true",
  theme_card_show_badge: "true",
  theme_card_badge_style: "filled",
  theme_card_price_weight: "300",
  theme_card_name_size: "14",
  theme_card_gap: "16",
  theme_card_columns_desktop: "3",
  theme_card_columns_mobile: "2",
  // Product Page
  theme_pdp_layout: "side-by-side",
  theme_pdp_gallery_style: "scroll",
  theme_pdp_show_breadcrumb: "true",
  theme_pdp_show_editor_notes: "true",
  theme_pdp_show_details_grid: "true",
  theme_pdp_show_trust_badges: "true",
  theme_pdp_image_aspect: "3/4",
  theme_pdp_sticky_info: "true",
  theme_pdp_show_related: "true",
  theme_pdp_show_sku: "false",
  // Category Page
  theme_category_layout: "standard",
  theme_category_show_header: "true",
  theme_category_show_filters: "true",
  theme_category_filter_position: "top",
  theme_category_show_count: "true",
  theme_category_products_per_page: "12",
  theme_category_show_sort: "true",
  // Shopping Bag / Cart
  theme_cart_style: "drawer",
  theme_cart_width: "384",
  theme_cart_show_thumbnails: "true",
  theme_cart_show_quantity: "true",
  theme_cart_show_continue: "true",
  theme_cart_show_subtotal: "true",
  theme_cart_cta_text: "Finalizar Compra",
  // Footer
  theme_footer_bg_h: "30", theme_footer_bg_s: "5", theme_footer_bg_l: "8",
  theme_footer_fg_h: "30", theme_footer_fg_s: "10", theme_footer_fg_l: "98",
  theme_footer_layout: "two-column",
  theme_footer_show_social: "true",
  theme_footer_show_newsletter: "false",
  theme_footer_tagline: "Joias minimalistas feitas para o indivíduo moderno",
  theme_footer_address_line1: "Rua Oscar Freire, 123",
  theme_footer_address_line2: "São Paulo, SP 01426-001",
  theme_footer_phone: "+55 (11) 3456-7890",
  theme_footer_email: "contato@lineajewelry.com.br",
  theme_footer_copyright: "© 2024 Linea. Todos os direitos reservados.",
  theme_footer_show_payment_icons: "false",
  // Social Media
  theme_social_instagram: "",
  theme_social_pinterest: "",
  theme_social_facebook: "",
  theme_social_tiktok: "",
  theme_social_twitter: "",
  theme_social_youtube: "",
  // SEO & Meta
  theme_seo_site_title: "Linea Jewelry",
  theme_seo_site_description: "Joias minimalistas feitas para o indivíduo moderno",
  theme_seo_og_image: "",
  theme_seo_favicon: "",
  theme_seo_title_separator: " | ",
  // Checkout
  theme_checkout_style: "single-page",
  theme_checkout_show_trust: "true",
  theme_checkout_show_order_bumps: "true",
  theme_checkout_show_coupon: "true",
  theme_checkout_trust_text: "Pagamento 100% seguro",
  // Global effects
  theme_animation_enabled: "true",
  theme_animation_intensity: "medium",
  theme_hover_scale: "1.05",
  theme_transition_speed: "700",
  theme_overlay_opacity: "0.05",
  // Custom CSS
  theme_custom_css: "",
};

const THEME_KEYS = Object.keys(DEFAULTS);

// ─── Theme Presets ────────────────────────────────────────
interface ThemePreset {
  name: string;
  description: string;
  values: Record<string, string>;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Minimal",
    description: "Clean, espaçoso, tipografia leve — layout arejado e minimalista",
    values: {
      // Colors
      theme_primary_h: "0", theme_primary_s: "0", theme_primary_l: "10",
      theme_bg_h: "0", theme_bg_s: "0", theme_bg_l: "100",
      theme_fg_h: "0", theme_fg_s: "0", theme_fg_l: "10",
      theme_accent_h: "0", theme_accent_s: "0", theme_accent_l: "95",
      theme_muted_h: "0", theme_muted_s: "0", theme_muted_l: "96",
      theme_border_h: "0", theme_border_s: "0", theme_border_l: "90",
      // Typography
      theme_font_display: "DM Sans", theme_font_body: "DM Sans",
      theme_heading_weight: "300", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.08",
      // Layout
      theme_border_radius: "0", theme_spacing_section: "112", theme_max_width: "1440",
      // Buttons
      theme_button_style: "outline", theme_button_radius: "0",
      theme_button_height: "48", theme_button_font_size: "11",
      theme_button_letter_spacing: "0.2", theme_button_font_weight: "300",
      // Status Bar
      theme_statusbar_bg_h: "0", theme_statusbar_bg_s: "0", theme_statusbar_bg_l: "10",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "32", theme_statusbar_font_size: "10",
      // Navigation
      theme_nav_bg_h: "0", theme_nav_bg_s: "0", theme_nav_bg_l: "100",
      theme_nav_fg_h: "0", theme_nav_fg_s: "0", theme_nav_fg_l: "10",
      theme_nav_height: "60", theme_nav_logo_height: "20",
      theme_nav_style: "centered", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "false",
      theme_nav_show_search: "false", theme_nav_show_wishlist: "false",
      // Product Card
      theme_card_aspect: "3/4", theme_card_hover_effect: "fade",
      theme_card_show_category: "false", theme_card_show_badge: "false",
      theme_card_badge_style: "outline", theme_card_price_weight: "300",
      theme_card_name_size: "13", theme_card_gap: "24",
      theme_card_columns_desktop: "3", theme_card_columns_mobile: "2",
      // Product Page
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "false",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "false",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      // Category
      theme_category_layout: "standard", theme_category_show_filters: "false",
      theme_category_show_count: "false", theme_category_show_sort: "false",
      // Cart
      theme_cart_style: "drawer", theme_cart_width: "360",
      // Footer
      theme_footer_bg_h: "0", theme_footer_bg_s: "0", theme_footer_bg_l: "10",
      theme_footer_fg_h: "0", theme_footer_fg_s: "0", theme_footer_fg_l: "95",
      theme_footer_layout: "minimal", theme_footer_show_social: "false",
      theme_footer_show_newsletter: "false", theme_footer_show_payment_icons: "false",
      // Effects
      theme_animation_enabled: "true", theme_animation_intensity: "subtle",
      theme_hover_scale: "1.02", theme_transition_speed: "500", theme_overlay_opacity: "0.03",
      // Checkout
      theme_checkout_style: "single-page", theme_checkout_show_trust: "false",
    },
  },
  {
    name: "Luxo",
    description: "Elegante, tons dourados, serif refinada — experiência premium",
    values: {
      // Colors
      theme_primary_h: "38", theme_primary_s: "60", theme_primary_l: "45",
      theme_bg_h: "30", theme_bg_s: "15", theme_bg_l: "97",
      theme_fg_h: "30", theme_fg_s: "10", theme_fg_l: "12",
      theme_accent_h: "38", theme_accent_s: "40", theme_accent_l: "90",
      theme_muted_h: "30", theme_muted_s: "10", theme_muted_l: "94",
      theme_border_h: "30", theme_border_s: "15", theme_border_l: "85",
      // Typography
      theme_font_display: "Cormorant Garamond", theme_font_body: "Raleway",
      theme_heading_weight: "400", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.06",
      // Layout
      theme_border_radius: "0", theme_spacing_section: "96", theme_max_width: "1440",
      // Buttons
      theme_button_style: "solid", theme_button_radius: "0",
      theme_button_height: "52", theme_button_font_size: "11",
      theme_button_letter_spacing: "0.18", theme_button_font_weight: "400",
      // Status Bar
      theme_statusbar_bg_h: "38", theme_statusbar_bg_s: "60", theme_statusbar_bg_l: "45",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "36", theme_statusbar_font_size: "10",
      // Navigation
      theme_nav_bg_h: "30", theme_nav_bg_s: "15", theme_nav_bg_l: "97",
      theme_nav_fg_h: "30", theme_nav_fg_s: "10", theme_nav_fg_l: "12",
      theme_nav_height: "72", theme_nav_logo_height: "28",
      theme_nav_style: "centered", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "true",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "true",
      // Product Card
      theme_card_aspect: "4/5", theme_card_hover_effect: "zoom",
      theme_card_show_category: "true", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "400",
      theme_card_name_size: "14", theme_card_gap: "20",
      theme_card_columns_desktop: "3", theme_card_columns_mobile: "2",
      // Product Page
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "thumbnails",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "true",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      // Category
      theme_category_layout: "editorial", theme_category_show_filters: "true",
      theme_category_filter_position: "top",
      theme_category_show_count: "true", theme_category_show_sort: "true",
      theme_category_products_per_page: "12",
      // Cart
      theme_cart_style: "drawer", theme_cart_width: "420",
      // Footer
      theme_footer_bg_h: "30", theme_footer_bg_s: "10", theme_footer_bg_l: "8",
      theme_footer_fg_h: "30", theme_footer_fg_s: "15", theme_footer_fg_l: "90",
      theme_footer_layout: "three-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "true", theme_footer_show_payment_icons: "true",
      // Effects
      theme_animation_enabled: "true", theme_animation_intensity: "medium",
      theme_hover_scale: "1.05", theme_transition_speed: "700", theme_overlay_opacity: "0.05",
      // Checkout
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
      theme_checkout_show_order_bumps: "true", theme_checkout_show_coupon: "true",
    },
  },
  {
    name: "Moderno",
    description: "Contemporâneo, arrojado, cantos arredondados — tech-forward",
    values: {
      // Colors
      theme_primary_h: "220", theme_primary_s: "15", theme_primary_l: "15",
      theme_bg_h: "220", theme_bg_s: "5", theme_bg_l: "98",
      theme_fg_h: "220", theme_fg_s: "15", theme_fg_l: "10",
      theme_accent_h: "220", theme_accent_s: "20", theme_accent_l: "92",
      theme_muted_h: "220", theme_muted_s: "8", theme_muted_l: "95",
      theme_border_h: "220", theme_border_s: "10", theme_border_l: "88",
      // Typography
      theme_font_display: "Montserrat", theme_font_body: "Inter",
      theme_heading_weight: "600", theme_body_weight: "400",
      theme_letter_spacing_editorial: "0.03",
      // Layout
      theme_border_radius: "0.75", theme_spacing_section: "80", theme_max_width: "1280",
      // Buttons
      theme_button_style: "solid", theme_button_radius: "8",
      theme_button_height: "48", theme_button_font_size: "13",
      theme_button_letter_spacing: "0.05", theme_button_font_weight: "500",
      // Status Bar
      theme_statusbar_bg_h: "220", theme_statusbar_bg_s: "15", theme_statusbar_bg_l: "15",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "36", theme_statusbar_font_size: "11",
      // Navigation
      theme_nav_bg_h: "220", theme_nav_bg_s: "5", theme_nav_bg_l: "98",
      theme_nav_fg_h: "220", theme_nav_fg_s: "15", theme_nav_fg_l: "10",
      theme_nav_height: "64", theme_nav_logo_height: "24",
      theme_nav_style: "left-aligned", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "false",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "true",
      // Product Card
      theme_card_aspect: "square", theme_card_hover_effect: "slide",
      theme_card_show_category: "true", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "500",
      theme_card_name_size: "14", theme_card_gap: "16",
      theme_card_columns_desktop: "4", theme_card_columns_mobile: "2",
      // Product Page
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "true",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "true",
      // Category
      theme_category_layout: "masonry", theme_category_show_filters: "true",
      theme_category_filter_position: "sidebar",
      theme_category_show_count: "true", theme_category_show_sort: "true",
      theme_category_products_per_page: "16",
      // Cart
      theme_cart_style: "drawer", theme_cart_width: "400",
      // Footer
      theme_footer_bg_h: "220", theme_footer_bg_s: "15", theme_footer_bg_l: "10",
      theme_footer_fg_h: "220", theme_footer_fg_s: "5", theme_footer_fg_l: "90",
      theme_footer_layout: "three-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "true", theme_footer_show_payment_icons: "true",
      // Effects
      theme_animation_enabled: "true", theme_animation_intensity: "medium",
      theme_hover_scale: "1.05", theme_transition_speed: "600", theme_overlay_opacity: "0.06",
      // Checkout
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
      theme_checkout_show_order_bumps: "true",
    },
  },
  {
    name: "Bold",
    description: "Ousado, modo escuro, impactante — drama e contraste máximo",
    values: {
      // Colors
      theme_primary_h: "0", theme_primary_s: "0", theme_primary_l: "95",
      theme_bg_h: "0", theme_bg_s: "0", theme_bg_l: "5",
      theme_fg_h: "0", theme_fg_s: "0", theme_fg_l: "95",
      theme_accent_h: "0", theme_accent_s: "0", theme_accent_l: "15",
      theme_muted_h: "0", theme_muted_s: "0", theme_muted_l: "12",
      theme_border_h: "0", theme_border_s: "0", theme_border_l: "20",
      // Typography
      theme_font_display: "Playfair Display", theme_font_body: "DM Sans",
      theme_heading_weight: "700", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.04",
      // Layout
      theme_border_radius: "0", theme_spacing_section: "80", theme_max_width: "1600",
      // Buttons
      theme_button_style: "solid", theme_button_radius: "0",
      theme_button_height: "56", theme_button_font_size: "13",
      theme_button_letter_spacing: "0.12", theme_button_font_weight: "500",
      // Status Bar
      theme_statusbar_bg_h: "0", theme_statusbar_bg_s: "0", theme_statusbar_bg_l: "95",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "5",
      theme_statusbar_visible: "true", theme_statusbar_height: "40", theme_statusbar_font_size: "11",
      // Navigation
      theme_nav_bg_h: "0", theme_nav_bg_s: "0", theme_nav_bg_l: "5",
      theme_nav_fg_h: "0", theme_nav_fg_s: "0", theme_nav_fg_l: "95",
      theme_nav_height: "72", theme_nav_logo_height: "26",
      theme_nav_style: "left-aligned", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "true",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "false",
      // Product Card
      theme_card_aspect: "3/4", theme_card_hover_effect: "zoom",
      theme_card_show_category: "false", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "500",
      theme_card_name_size: "15", theme_card_gap: "12",
      theme_card_columns_desktop: "2", theme_card_columns_mobile: "1",
      // Product Page
      theme_pdp_layout: "stacked", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "false", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "false",
      theme_pdp_sticky_info: "false", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      // Category
      theme_category_layout: "highlight", theme_category_show_filters: "false",
      theme_category_show_count: "false", theme_category_show_sort: "true",
      theme_category_products_per_page: "8",
      // Cart
      theme_cart_style: "drawer", theme_cart_width: "440",
      // Footer
      theme_footer_bg_h: "0", theme_footer_bg_s: "0", theme_footer_bg_l: "3",
      theme_footer_fg_h: "0", theme_footer_fg_s: "0", theme_footer_fg_l: "80",
      theme_footer_layout: "two-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "false", theme_footer_show_payment_icons: "false",
      // Effects
      theme_animation_enabled: "true", theme_animation_intensity: "dramatic",
      theme_hover_scale: "1.08", theme_transition_speed: "800", theme_overlay_opacity: "0.08",
      // Checkout
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
    },
  },
];

// ─── Section Definitions ──────────────────────────────────
type SectionId =
  | "presets" | "homepage_sections"
  | "colors" | "typography" | "layout" | "buttons"
  | "statusbar" | "header" | "product_card" | "product_page"
  | "category" | "cart" | "footer" | "checkout"
  | "effects" | "social" | "seo" | "custom_css";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof Palette;
  group: string;
}

const SECTIONS: SectionDef[] = [
  { id: "presets", label: "Presets de Tema", icon: Sparkles, group: "Início Rápido" },
  { id: "homepage_sections", label: "Seções da Homepage", icon: Home, group: "Início Rápido" },
  { id: "colors", label: "Cores", icon: Palette, group: "Design" },
  { id: "typography", label: "Tipografia", icon: Type, group: "Design" },
  { id: "layout", label: "Layout & Espaçamento", icon: Layout, group: "Design" },
  { id: "buttons", label: "Botões", icon: Square, group: "Design" },
  { id: "effects", label: "Animações & Efeitos", icon: Layers, group: "Design" },
  { id: "statusbar", label: "Barra de Anúncio", icon: Megaphone, group: "Seções" },
  { id: "header", label: "Cabeçalho / Navegação", icon: Menu, group: "Seções" },
  { id: "product_card", label: "Card de Produto", icon: ShoppingBag, group: "Seções" },
  { id: "product_page", label: "Página de Produto", icon: Eye, group: "Seções" },
  { id: "category", label: "Página de Categoria", icon: Grid3X3, group: "Seções" },
  { id: "cart", label: "Carrinho / Sacola", icon: ShoppingBag, group: "Seções" },
  { id: "footer", label: "Rodapé", icon: ArrowUp, group: "Seções" },
  { id: "checkout", label: "Checkout", icon: CreditCard, group: "Seções" },
  { id: "social", label: "Redes Sociais", icon: Share2, group: "Configurações" },
  { id: "seo", label: "SEO & Meta Tags", icon: Search, group: "Configurações" },
  { id: "custom_css", label: "CSS Personalizado", icon: Code, group: "Configurações" },
];

// Map iframe section clicks to editor sections
const INLINE_SECTION_MAP: Record<string, SectionId> = {
  statusbar: "statusbar",
  navigation: "header",
  header: "header",
  footer: "footer",
  hero: "colors",
  "product-grid": "product_card",
  "product-carousel": "product_card",
  "product-detail": "product_page",
  category: "category",
  cart: "cart",
  checkout: "checkout",
};

type Viewport = "desktop" | "tablet" | "mobile";

// ─── Inline editing script injected into iframe ───────────
const INLINE_EDIT_SCRIPT = `
(function() {
  if (window.__themeEditorReady) return;
  window.__themeEditorReady = true;

  const sectionSelectors = [
    { selector: '[data-theme-section]', attr: true },
    { selector: 'header', id: 'header' },
    { selector: 'footer', id: 'footer' },
    { selector: 'main > *', id: null },
  ];

  let overlay = document.createElement('div');
  overlay.id = '__theme-overlay';
  overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid hsl(210,100%,52%);background:hsla(210,100%,52%,0.05);transition:all 0.15s ease;opacity:0;border-radius:2px;';
  document.body.appendChild(overlay);

  let label = document.createElement('div');
  label.id = '__theme-label';
  label.style.cssText = 'position:fixed;z-index:100000;pointer-events:none;background:hsl(210,100%,52%);color:white;font-size:11px;font-family:system-ui;padding:2px 8px;border-radius:2px;opacity:0;transition:opacity 0.15s;white-space:nowrap;';
  document.body.appendChild(label);

  const SECTION_LABELS = {
    statusbar: 'Barra de Anúncio',
    navigation: 'Navegação',
    header: 'Cabeçalho',
    footer: 'Rodapé',
    hero: 'Hero',
    'product-grid': 'Grid de Produtos',
    'product-carousel': 'Carrossel de Produtos',
    'product-detail': 'Página de Produto',
    'full-width-banner': 'Banner Full Width',
    'story-section': 'Seção de História',
    'asymmetric-grid': 'Grid Assimétrico',
    category: 'Página de Categoria',
    cart: 'Carrinho',
    checkout: 'Checkout',
  };

  function getSection(el) {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.dataset && cur.dataset.themeSection) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  document.addEventListener('mousemove', function(e) {
    let sec = getSection(e.target);
    if (sec) {
      let rect = sec.getBoundingClientRect();
      overlay.style.top = rect.top + 'px';
      overlay.style.left = rect.left + 'px';
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';
      overlay.style.opacity = '1';
      let name = sec.dataset.themeSection;
      label.textContent = (SECTION_LABELS[name] || name) + ' — Clique para editar';
      label.style.top = Math.max(0, rect.top - 24) + 'px';
      label.style.left = rect.left + 'px';
      label.style.opacity = '1';
    } else {
      overlay.style.opacity = '0';
      label.style.opacity = '0';
    }
  });

  document.addEventListener('mouseleave', function() {
    overlay.style.opacity = '0';
    label.style.opacity = '0';
  });

  document.addEventListener('click', function(e) {
    let sec = getSection(e.target);
    if (sec) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: 'theme-section-click', section: sec.dataset.themeSection }, '*');
    }
  }, true);
})();
`;

// ─── Main Component ───────────────────────────────────────
const AdminThemeEditor = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const { data: homepageSections } = useHomepageSections();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("presets");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inlineEditMode, setInlineEditMode] = useState(true);

  useEffect(() => {
    if (settings) {
      const merged = { ...DEFAULTS };
      THEME_KEYS.forEach(key => {
        if (settings[key]) merged[key] = settings[key];
      });
      setTheme(merged);
    }
  }, [settings]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "theme-section-click" && e.data.section) {
        const mapped = INLINE_SECTION_MAP[e.data.section];
        if (mapped) {
          setActiveSection(mapped);
          if (sidebarCollapsed) setSidebarCollapsed(false);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sidebarCollapsed]);

  const applyToIframe = useCallback((t: Record<string, string>) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage({ type: "theme-preview-update", theme: t }, "*");
    if (inlineEditMode) {
      iframe.contentWindow.postMessage({ type: "theme-enable-inline-edit", script: INLINE_EDIT_SCRIPT }, "*");
    }
  }, [inlineEditMode]);

  const updateTheme = (key: string, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    applyToIframe(newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = THEME_KEYS.filter(key => theme[key] !== (settings?.[key] || DEFAULTS[key]));
      for (const key of changed) {
        await updateSetting.mutateAsync({ key, value: theme[key] });
      }
      toast.success("Tema salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar tema");
    }
    setSaving(false);
  };

  const handleReset = () => {
    setTheme(DEFAULTS);
    applyToIframe(DEFAULTS);
  };

  const handleIframeLoad = () => applyToIframe(theme);

  const viewportWidths: Record<Viewport, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
      </div>
    );
  }

  const groups = SECTIONS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, SectionDef[]>);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-[hsl(var(--admin-bg))]">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <h1 className="text-[15px] font-semibold">Editor de Tema</h1>
          <span className="text-[11px] text-muted-foreground ml-2">
            {SECTIONS.find(s => s.id === activeSection)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInlineEditMode(!inlineEditMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              inlineEditMode ? "bg-[hsl(var(--admin-info)/0.1)] text-[hsl(var(--admin-info))]" : "bg-[hsl(var(--admin-bg))] text-muted-foreground"
            }`}
            title="Edição inline: clique nas seções do preview para navegar"
          >
            <MousePointer className="h-3 w-3" />
            Inline
          </button>
          <div className="flex items-center gap-0.5 bg-[hsl(var(--admin-bg))] rounded-lg p-0.5">
            {([
              { id: "desktop" as Viewport, icon: Monitor },
              { id: "tablet" as Viewport, icon: Tablet },
              { id: "mobile" as Viewport, icon: Smartphone },
            ]).map(v => (
              <button key={v.id} onClick={() => setViewport(v.id)}
                className={`p-1.5 rounded-md transition-colors ${viewport === v.id ? "bg-[hsl(var(--admin-surface))] shadow-sm" : "hover:bg-[hsl(var(--admin-surface))]"}`}>
                <v.icon className={`h-3.5 w-3.5 ${viewport === v.id ? "text-foreground" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 text-[12px] rounded-lg">
            <RotateCcw className="h-3 w-3 mr-1" /> Resetar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-[12px] rounded-lg">
            <Save className="h-3 w-3 mr-1" /> {saving ? "Salvando..." : "Salvar tema"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Settings panel */}
        <div className={`border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "w-0 border-r-0" : "w-80"}`}>
          {!sidebarCollapsed && (
            <>
              <ScrollArea className="h-48 shrink-0 border-b border-[hsl(var(--admin-border))]">
                <div className="p-3 space-y-3">
                  {Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                      <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mb-1.5 px-1">{group}</p>
                      <div className="space-y-0.5">
                        {items.map(s => (
                          <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
                              activeSection === s.id
                                ? "bg-foreground/10 text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--admin-bg))]"
                            }`}>
                            <s.icon className="h-3.5 w-3.5 shrink-0" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                  {activeSection === "presets" && (
                    <PresetsSection
                      theme={theme}
                      onApply={(preset) => {
                        const newTheme = { ...theme, ...preset };
                        setTheme(newTheme);
                        applyToIframe(newTheme);
                        toast.success("Preset aplicado! Clique 'Salvar tema' para persistir.");
                      }}
                    />
                  )}
                  {activeSection === "homepage_sections" && (
                    <HomepageSectionsPanel
                      sections={homepageSections || []}
                      iframeRef={iframeRef}
                    />
                  )}
                  {activeSection === "colors" && <ColorsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "typography" && <TypographySection theme={theme} onChange={updateTheme} />}
                  {activeSection === "layout" && <LayoutSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "buttons" && <ButtonsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "effects" && <EffectsSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "statusbar" && <StatusBarSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "header" && <HeaderSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "product_card" && <ProductCardSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "product_page" && <ProductPageSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "category" && <CategorySection theme={theme} onChange={updateTheme} />}
                  {activeSection === "cart" && <CartSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "footer" && <FooterSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "checkout" && <CheckoutSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "social" && <SocialSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "seo" && <SeoSection theme={theme} onChange={updateTheme} />}
                  {activeSection === "custom_css" && <CustomCssSection theme={theme} onChange={updateTheme} />}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Live preview */}
        <div className="flex-1 bg-[hsl(var(--admin-bg))] flex items-stretch justify-center p-4 overflow-auto">
          <div className="bg-white shadow-lg transition-all duration-300 mx-auto"
            style={{ width: viewportWidths[viewport], maxWidth: "100%", height: "100%", minHeight: 0, borderRadius: viewport !== "desktop" ? "12px" : "0", overflow: "hidden" }}>
            <iframe ref={iframeRef} src="/" className="w-full h-full border-0" title="Theme Preview" onLoad={handleIframeLoad} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Shared Components ────────────────────────────────────
interface FieldProps {
  theme: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{children}</h3>
);

const FieldGroup = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="space-y-1.5">
    {label && <Label className="text-[12px] text-muted-foreground">{label}</Label>}
    {children}
  </div>
);

// HSL ↔ Hex conversion helpers
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const ColorGroup = ({ label, hKey, sKey, lKey, theme, onChange }: {
  label: string; hKey: string; sKey: string; lKey: string;
  theme: Record<string, string>; onChange: (key: string, value: string) => void;
}) => {
  const h = parseInt(theme[hKey]) || 0;
  const s = parseInt(theme[sKey]) || 0;
  const l = parseInt(theme[lKey]) || 0;
  const hexValue = hslToHex(h, s, l);

  const handleColorChange = (hex: string) => {
    const [newH, newS, newL] = hexToHsl(hex);
    onChange(hKey, String(newH));
    onChange(sKey, String(newS));
    onChange(lKey, String(newL));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[12px] text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase">{hexValue}</span>
          <label className="relative w-7 h-7 rounded-md border border-[hsl(var(--admin-border))] cursor-pointer overflow-hidden">
            <input
              type="color"
              value={hexValue}
              onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-full rounded-md" style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }} />
          </label>
        </div>
      </div>
    </div>
  );
};

const ToggleField = ({ label, themeKey, theme, onChange, description }: FieldProps & { label: string; themeKey: string; description?: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[12px]">{label}</p>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={theme[themeKey] === "true"} onCheckedChange={(v) => onChange(themeKey, String(v))} />
  </div>
);

const SliderField = ({ label, themeKey, theme, onChange, min, max, step = 1, unit = "" }: FieldProps & { label: string; themeKey: string; min: number; max: number; step?: number; unit?: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      <span className="text-[11px] text-muted-foreground">{theme[themeKey]}{unit}</span>
    </div>
    <Slider value={[parseFloat(theme[themeKey]) || 0]} onValueChange={([v]) => onChange(themeKey, String(v))} min={min} max={max} step={step} />
  </div>
);

const SelectField = ({ label, themeKey, theme, onChange, options }: FieldProps & { label: string; themeKey: string; options: { value: string; label: string }[] }) => (
  <div className="space-y-1.5">
    <Label className="text-[12px] text-muted-foreground">{label}</Label>
    <Select value={theme[themeKey]} onValueChange={(v) => onChange(themeKey, v)}>
      <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

const OptionCards = ({ themeKey, theme, onChange, options }: FieldProps & { themeKey: string; options: { value: string; label: string; desc?: string }[] }) => (
  <div className="space-y-1.5">
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(themeKey, o.value)}
        className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
          theme[themeKey] === o.value ? "border-foreground bg-foreground/5" : "border-[hsl(var(--admin-border))] hover:border-foreground/30"
        }`}>
        <p className="text-[12px] font-medium">{o.label}</p>
        {o.desc && <p className="text-[10px] text-muted-foreground">{o.desc}</p>}
      </button>
    ))}
  </div>
);

const TextInputField = ({ label, themeKey, theme, onChange, placeholder }: FieldProps & { label: string; themeKey: string; placeholder?: string }) => (
  <FieldGroup label={label}>
    <Input value={theme[themeKey]} onChange={(e) => onChange(themeKey, e.target.value)}
      className="h-8 text-[12px]" placeholder={placeholder} />
  </FieldGroup>
);

// ─── Section Panels ───────────────────────────────────────

const ColorsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Paleta de Cores</SectionTitle>
    <ColorGroup label="Cor Primária" hKey="theme_primary_h" sKey="theme_primary_s" lKey="theme_primary_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Fundo" hKey="theme_bg_h" sKey="theme_bg_s" lKey="theme_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_fg_h" sKey="theme_fg_s" lKey="theme_fg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Acento" hKey="theme_accent_h" sKey="theme_accent_s" lKey="theme_accent_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Neutro / Muted" hKey="theme_muted_h" sKey="theme_muted_s" lKey="theme_muted_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Bordas" hKey="theme_border_h" sKey="theme_border_s" lKey="theme_border_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Destrutivo / Erro" hKey="theme_destructive_h" sKey="theme_destructive_s" lKey="theme_destructive_l" theme={theme} onChange={onChange} />
  </>
);

const TypographySection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Tipografia</SectionTitle>
    <SelectField label="Fonte de Display (Títulos)" themeKey="theme_font_display" theme={theme} onChange={onChange}
      options={FONT_OPTIONS} />
    <SelectField label="Fonte do Corpo (Texto)" themeKey="theme_font_body" theme={theme} onChange={onChange}
      options={FONT_OPTIONS} />
    <SliderField label="Tamanho Base" themeKey="theme_font_size_base" theme={theme} onChange={onChange} min={12} max={20} unit="px" />
    <SelectField label="Peso dos Títulos" themeKey="theme_heading_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light (200)" }, { value: "300", label: "Light (300)" },
        { value: "400", label: "Regular (400)" }, { value: "500", label: "Medium (500)" },
        { value: "600", label: "Semi Bold (600)" }, { value: "700", label: "Bold (700)" },
      ]} />
    <SelectField label="Peso do Corpo" themeKey="theme_body_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light (200)" }, { value: "300", label: "Light (300)" },
        { value: "400", label: "Regular (400)" }, { value: "500", label: "Medium (500)" },
      ]} />
    <SliderField label="Tracking Editorial" themeKey="theme_letter_spacing_editorial" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} unit="em" />
    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] space-y-2">
      <p className="text-[10px] text-muted-foreground">Preview</p>
      <p className="text-2xl" style={{ fontFamily: theme.theme_font_display, fontWeight: parseInt(theme.theme_heading_weight) }}>Título Display</p>
      <p className="text-[13px]" style={{ fontFamily: theme.theme_font_body, fontWeight: parseInt(theme.theme_body_weight) }}>
        Texto do corpo com a fonte e peso selecionados.
      </p>
      <p className="text-[10px] uppercase" style={{ fontFamily: theme.theme_font_body, letterSpacing: `${theme.theme_letter_spacing_editorial}em` }}>
        Texto Editorial
      </p>
    </div>
  </>
);

const LayoutSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Layout & Espaçamento</SectionTitle>
    <SliderField label="Border Radius Global" themeKey="theme_border_radius" theme={theme} onChange={onChange} min={0} max={1.5} step={0.125} unit="rem" />
    <div className="flex gap-2">
      {[0, 0.25, 0.375, 0.5, 0.75, 1].map(r => (
        <button key={r} onClick={() => onChange("theme_border_radius", String(r))}
          className={`w-10 h-10 border-2 transition-colors ${theme.theme_border_radius === String(r) ? "border-foreground" : "border-[hsl(var(--admin-border))]"}`}
          style={{ borderRadius: `${r}rem` }} />
      ))}
    </div>
    <SliderField label="Espaçamento entre Seções" themeKey="theme_spacing_section" theme={theme} onChange={onChange} min={48} max={160} step={8} unit="px" />
    <SliderField label="Largura Máxima do Conteúdo" themeKey="theme_max_width" theme={theme} onChange={onChange} min={1024} max={1920} step={40} unit="px" />
  </>
);

const ButtonsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Botões</SectionTitle>
    <OptionCards themeKey="theme_button_style" theme={theme} onChange={onChange} options={[
      { value: "solid", label: "Sólido", desc: "Fundo preenchido com contraste" },
      { value: "outline", label: "Outline", desc: "Apenas borda, sem preenchimento" },
      { value: "minimal", label: "Minimal", desc: "Sem borda nem fundo" },
    ]} />
    <SliderField label="Border Radius" themeKey="theme_button_radius" theme={theme} onChange={onChange} min={0} max={30} unit="px" />
    <SliderField label="Altura" themeKey="theme_button_height" theme={theme} onChange={onChange} min={36} max={64} unit="px" />
    <SliderField label="Tamanho da Fonte" themeKey="theme_button_font_size" theme={theme} onChange={onChange} min={10} max={16} unit="px" />
    <SliderField label="Letter Spacing" themeKey="theme_button_letter_spacing" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} unit="em" />
    <SelectField label="Peso da Fonte" themeKey="theme_button_font_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light" }, { value: "300", label: "Light" },
        { value: "400", label: "Regular" }, { value: "500", label: "Medium" },
        { value: "600", label: "Semi Bold" },
      ]} />
    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))] flex flex-col gap-2 items-center">
      <p className="text-[10px] text-muted-foreground self-start">Preview</p>
      <button className="px-8 transition-all" style={{
        height: `${theme.theme_button_height}px`,
        borderRadius: `${theme.theme_button_radius}px`,
        fontSize: `${theme.theme_button_font_size}px`,
        fontWeight: parseInt(theme.theme_button_font_weight),
        letterSpacing: `${theme.theme_button_letter_spacing}em`,
        textTransform: "uppercase" as const,
        ...(theme.theme_button_style === "solid" ? { backgroundColor: "hsl(var(--foreground))", color: "hsl(var(--background))" } :
          theme.theme_button_style === "outline" ? { border: "1px solid hsl(var(--foreground))", background: "transparent" } :
          { background: "transparent", textDecoration: "underline" }),
      }}>
        Adicionar à Sacola
      </button>
    </div>
  </>
);

const EffectsSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Animações & Efeitos</SectionTitle>
    <ToggleField label="Animações habilitadas" themeKey="theme_animation_enabled" theme={theme} onChange={onChange} description="Ativa/desativa todas as animações" />
    <SelectField label="Intensidade" themeKey="theme_animation_intensity" theme={theme} onChange={onChange}
      options={[
        { value: "subtle", label: "Sutil" }, { value: "medium", label: "Médio" }, { value: "dramatic", label: "Dramático" },
      ]} />
    <SliderField label="Escala no Hover (imagens)" themeKey="theme_hover_scale" theme={theme} onChange={onChange} min={1} max={1.15} step={0.01} />
    <SliderField label="Velocidade da Transição" themeKey="theme_transition_speed" theme={theme} onChange={onChange} min={200} max={1200} step={50} unit="ms" />
    <SliderField label="Opacidade do Overlay" themeKey="theme_overlay_opacity" theme={theme} onChange={onChange} min={0} max={0.3} step={0.01} />
  </>
);

const StatusBarSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Barra de Anúncio</SectionTitle>
    <ToggleField label="Visível" themeKey="theme_statusbar_visible" theme={theme} onChange={onChange} />
    <ColorGroup label="Fundo" hKey="theme_statusbar_bg_h" sKey="theme_statusbar_bg_s" lKey="theme_statusbar_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_statusbar_fg_h" sKey="theme_statusbar_fg_s" lKey="theme_statusbar_fg_l" theme={theme} onChange={onChange} />
    <SliderField label="Altura" themeKey="theme_statusbar_height" theme={theme} onChange={onChange} min={28} max={48} unit="px" />
    <SliderField label="Tamanho da Fonte" themeKey="theme_statusbar_font_size" theme={theme} onChange={onChange} min={8} max={14} unit="px" />
    <div className="border-t border-[hsl(var(--admin-border))] pt-4 mt-2">
      <SectionTitle>Mensagens Rotativas</SectionTitle>
    </div>
    <TextInputField label="Mensagem 1" themeKey="theme_statusbar_text_1" theme={theme} onChange={onChange} placeholder="Frete grátis acima de R$250" />
    <TextInputField label="Mensagem 2" themeKey="theme_statusbar_text_2" theme={theme} onChange={onChange} placeholder="Garantia de 365 dias" />
    <TextInputField label="Mensagem 3" themeKey="theme_statusbar_text_3" theme={theme} onChange={onChange} placeholder="+100.000 clientes satisfeitos" />
    <SliderField label="Velocidade de Rotação" themeKey="theme_statusbar_rotation_speed" theme={theme} onChange={onChange} min={1000} max={10000} step={500} unit="ms" />
  </>
);

const HeaderSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Cabeçalho / Navegação</SectionTitle>
    <ColorGroup label="Fundo da Navegação" hKey="theme_nav_bg_h" sKey="theme_nav_bg_s" lKey="theme_nav_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto da Navegação" hKey="theme_nav_fg_h" sKey="theme_nav_fg_s" lKey="theme_nav_fg_l" theme={theme} onChange={onChange} />
    <SliderField label="Altura do Header" themeKey="theme_nav_height" theme={theme} onChange={onChange} min={48} max={96} unit="px" />
    <SliderField label="Altura do Logo" themeKey="theme_nav_logo_height" theme={theme} onChange={onChange} min={16} max={48} unit="px" />
    <SelectField label="Estilo do Logo" themeKey="theme_nav_style" theme={theme} onChange={onChange}
      options={[
        { value: "centered", label: "Logo Centralizado" },
        { value: "left", label: "Logo à Esquerda" },
      ]} />
    <ToggleField label="Header Fixo (Sticky)" themeKey="theme_nav_sticky" theme={theme} onChange={onChange} />
    <ToggleField label="Transparente no Hero" themeKey="theme_nav_transparent_hero" theme={theme} onChange={onChange} description="Header transparente sobre a imagem hero" />
    <ToggleField label="Mostrar Busca" themeKey="theme_nav_show_search" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Favoritos" themeKey="theme_nav_show_wishlist" theme={theme} onChange={onChange} />
  </>
);

const ProductCardSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Card de Produto</SectionTitle>
    <SelectField label="Proporção da Imagem" themeKey="theme_card_aspect" theme={theme} onChange={onChange}
      options={[
        { value: "1/1", label: "Quadrado (1:1)" }, { value: "3/4", label: "Retrato (3:4)" },
        { value: "4/5", label: "Retrato Alto (4:5)" }, { value: "2/3", label: "Retrato Estreito (2:3)" },
      ]} />
    <SelectField label="Efeito de Hover" themeKey="theme_card_hover_effect" theme={theme} onChange={onChange}
      options={[
        { value: "zoom", label: "Zoom" }, { value: "fade-swap", label: "Troca de Imagem" }, { value: "none", label: "Nenhum" },
      ]} />
    <ToggleField label="Mostrar Categoria" themeKey="theme_card_show_category" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Badge 'Novo'" themeKey="theme_card_show_badge" theme={theme} onChange={onChange} />
    <SelectField label="Estilo do Badge" themeKey="theme_card_badge_style" theme={theme} onChange={onChange}
      options={[
        { value: "filled", label: "Preenchido" }, { value: "outline", label: "Outline" }, { value: "minimal", label: "Texto Simples" },
      ]} />
    <SliderField label="Tamanho do Nome" themeKey="theme_card_name_size" theme={theme} onChange={onChange} min={12} max={18} unit="px" />
    <SelectField label="Peso do Preço" themeKey="theme_card_price_weight" theme={theme} onChange={onChange}
      options={[
        { value: "200", label: "Extra Light" }, { value: "300", label: "Light" },
        { value: "400", label: "Regular" }, { value: "500", label: "Medium" },
      ]} />
    <SliderField label="Gap entre Cards" themeKey="theme_card_gap" theme={theme} onChange={onChange} min={8} max={32} step={4} unit="px" />
    <SelectField label="Colunas (Desktop)" themeKey="theme_card_columns_desktop" theme={theme} onChange={onChange}
      options={[
        { value: "2", label: "2 colunas" }, { value: "3", label: "3 colunas" }, { value: "4", label: "4 colunas" },
      ]} />
    <SelectField label="Colunas (Mobile)" themeKey="theme_card_columns_mobile" theme={theme} onChange={onChange}
      options={[
        { value: "1", label: "1 coluna" }, { value: "2", label: "2 colunas" },
      ]} />
  </>
);

const ProductPageSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Página de Produto</SectionTitle>
    <SelectField label="Layout" themeKey="theme_pdp_layout" theme={theme} onChange={onChange}
      options={[
        { value: "side-by-side", label: "Lado a Lado" },
        { value: "gallery-left", label: "Galeria à Esquerda" },
        { value: "full-width-hero", label: "Hero Full Width" },
      ]} />
    <SelectField label="Estilo da Galeria" themeKey="theme_pdp_gallery_style" theme={theme} onChange={onChange}
      options={[
        { value: "scroll", label: "Scroll Vertical" }, { value: "grid", label: "Grid" }, { value: "carousel", label: "Carrossel" },
      ]} />
    <SelectField label="Proporção das Imagens" themeKey="theme_pdp_image_aspect" theme={theme} onChange={onChange}
      options={[
        { value: "1/1", label: "Quadrado" }, { value: "3/4", label: "3:4" }, { value: "4/5", label: "4:5" }, { value: "auto", label: "Automático" },
      ]} />
    <ToggleField label="Breadcrumb" themeKey="theme_pdp_show_breadcrumb" theme={theme} onChange={onChange} />
    <ToggleField label="Notas do Editor" themeKey="theme_pdp_show_editor_notes" theme={theme} onChange={onChange} />
    <ToggleField label="Grid de Detalhes" themeKey="theme_pdp_show_details_grid" theme={theme} onChange={onChange} description="Material, dimensões, peso" />
    <ToggleField label="Badges de Confiança" themeKey="theme_pdp_show_trust_badges" theme={theme} onChange={onChange} />
    <ToggleField label="Info Fixa ao Scroll" themeKey="theme_pdp_sticky_info" theme={theme} onChange={onChange} description="Informações fixas enquanto rola galeria" />
    <ToggleField label="Produtos Relacionados" themeKey="theme_pdp_show_related" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar SKU" themeKey="theme_pdp_show_sku" theme={theme} onChange={onChange} />
  </>
);

const CategorySection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Página de Categoria</SectionTitle>
    <SelectField label="Layout do Grid" themeKey="theme_category_layout" theme={theme} onChange={onChange}
      options={[
        { value: "standard", label: "Padrão" }, { value: "editorial", label: "Editorial" },
        { value: "masonry", label: "Masonry" }, { value: "highlight", label: "Destaque" },
      ]} />
    <ToggleField label="Mostrar Header da Categoria" themeKey="theme_category_show_header" theme={theme} onChange={onChange} description="Imagem de banner e descrição" />
    <ToggleField label="Mostrar Filtros" themeKey="theme_category_show_filters" theme={theme} onChange={onChange} />
    <SelectField label="Posição dos Filtros" themeKey="theme_category_filter_position" theme={theme} onChange={onChange}
      options={[
        { value: "top", label: "Acima dos produtos" },
        { value: "sidebar", label: "Barra lateral" },
        { value: "drawer", label: "Drawer / Modal" },
      ]} />
    <ToggleField label="Mostrar Contagem" themeKey="theme_category_show_count" theme={theme} onChange={onChange} description="Exibir total de produtos" />
    <ToggleField label="Mostrar Ordenação" themeKey="theme_category_show_sort" theme={theme} onChange={onChange} />
    <SliderField label="Produtos por Página" themeKey="theme_category_products_per_page" theme={theme} onChange={onChange} min={6} max={48} step={3} />
  </>
);

const CartSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Carrinho / Sacola</SectionTitle>
    <SelectField label="Estilo do Carrinho" themeKey="theme_cart_style" theme={theme} onChange={onChange}
      options={[
        { value: "drawer", label: "Drawer Lateral" },
        { value: "page", label: "Página Completa" },
        { value: "dropdown", label: "Dropdown" },
      ]} />
    <SliderField label="Largura do Drawer" themeKey="theme_cart_width" theme={theme} onChange={onChange} min={300} max={500} step={8} unit="px" />
    <ToggleField label="Mostrar Thumbnails" themeKey="theme_cart_show_thumbnails" theme={theme} onChange={onChange} />
    <ToggleField label="Controles de Quantidade" themeKey="theme_cart_show_quantity" theme={theme} onChange={onChange} />
    <ToggleField label="Botão Continuar Comprando" themeKey="theme_cart_show_continue" theme={theme} onChange={onChange} />
    <ToggleField label="Exibir Subtotal" themeKey="theme_cart_show_subtotal" theme={theme} onChange={onChange} />
    <TextInputField label="Texto do CTA" themeKey="theme_cart_cta_text" theme={theme} onChange={onChange} placeholder="Finalizar Compra" />
  </>
);

const FooterSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Rodapé</SectionTitle>
    <ColorGroup label="Fundo" hKey="theme_footer_bg_h" sKey="theme_footer_bg_s" lKey="theme_footer_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_footer_fg_h" sKey="theme_footer_fg_s" lKey="theme_footer_fg_l" theme={theme} onChange={onChange} />
    <SelectField label="Layout" themeKey="theme_footer_layout" theme={theme} onChange={onChange}
      options={[
        { value: "two-column", label: "Duas Colunas" },
        { value: "three-column", label: "Três Colunas" },
        { value: "centered", label: "Centralizado" },
        { value: "minimal", label: "Minimal" },
      ]} />
    <ToggleField label="Mostrar Redes Sociais" themeKey="theme_footer_show_social" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Newsletter" themeKey="theme_footer_show_newsletter" theme={theme} onChange={onChange} />
    <ToggleField label="Ícones de Pagamento" themeKey="theme_footer_show_payment_icons" theme={theme} onChange={onChange} description="Visa, Mastercard, Pix, etc." />
    <div className="border-t border-[hsl(var(--admin-border))] pt-4 mt-2">
      <SectionTitle>Conteúdo do Rodapé</SectionTitle>
    </div>
    <TextInputField label="Tagline" themeKey="theme_footer_tagline" theme={theme} onChange={onChange} placeholder="Joias minimalistas..." />
    <TextInputField label="Endereço (linha 1)" themeKey="theme_footer_address_line1" theme={theme} onChange={onChange} placeholder="Rua Oscar Freire, 123" />
    <TextInputField label="Endereço (linha 2)" themeKey="theme_footer_address_line2" theme={theme} onChange={onChange} placeholder="São Paulo, SP" />
    <TextInputField label="Telefone" themeKey="theme_footer_phone" theme={theme} onChange={onChange} placeholder="+55 (11) 3456-7890" />
    <TextInputField label="E-mail" themeKey="theme_footer_email" theme={theme} onChange={onChange} placeholder="contato@loja.com" />
    <TextInputField label="Texto de Copyright" themeKey="theme_footer_copyright" theme={theme} onChange={onChange} placeholder="© 2024 Marca. Todos os direitos reservados." />
  </>
);

const CheckoutSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Checkout</SectionTitle>
    <SelectField label="Estilo do Checkout" themeKey="theme_checkout_style" theme={theme} onChange={onChange}
      options={[
        { value: "single-page", label: "Página Única" },
        { value: "multi-step", label: "Multi Etapas" },
      ]} />
    <ToggleField label="Mostrar Selos de Confiança" themeKey="theme_checkout_show_trust" theme={theme} onChange={onChange} />
    <ToggleField label="Mostrar Order Bumps" themeKey="theme_checkout_show_order_bumps" theme={theme} onChange={onChange} description="Ofertas especiais no checkout" />
    <ToggleField label="Mostrar Campo de Cupom" themeKey="theme_checkout_show_coupon" theme={theme} onChange={onChange} />
    <TextInputField label="Texto de Confiança" themeKey="theme_checkout_trust_text" theme={theme} onChange={onChange} placeholder="Pagamento 100% seguro" />
  </>
);

const SocialSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Redes Sociais</SectionTitle>
    <p className="text-[11px] text-muted-foreground">Links exibidos no rodapé e em toda a loja</p>
    <TextInputField label="Instagram" themeKey="theme_social_instagram" theme={theme} onChange={onChange} placeholder="https://instagram.com/suamarca" />
    <TextInputField label="Pinterest" themeKey="theme_social_pinterest" theme={theme} onChange={onChange} placeholder="https://pinterest.com/suamarca" />
    <TextInputField label="Facebook" themeKey="theme_social_facebook" theme={theme} onChange={onChange} placeholder="https://facebook.com/suamarca" />
    <TextInputField label="TikTok" themeKey="theme_social_tiktok" theme={theme} onChange={onChange} placeholder="https://tiktok.com/@suamarca" />
    <TextInputField label="Twitter / X" themeKey="theme_social_twitter" theme={theme} onChange={onChange} placeholder="https://x.com/suamarca" />
    <TextInputField label="YouTube" themeKey="theme_social_youtube" theme={theme} onChange={onChange} placeholder="https://youtube.com/@suamarca" />
  </>
);

const SeoSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>SEO & Meta Tags</SectionTitle>
    <p className="text-[11px] text-muted-foreground">Configurações globais de SEO para sua loja</p>
    <TextInputField label="Título do Site" themeKey="theme_seo_site_title" theme={theme} onChange={onChange} placeholder="Nome da Loja" />
    <FieldGroup label="Descrição do Site">
      <Textarea value={theme.theme_seo_site_description} onChange={(e) => onChange("theme_seo_site_description", e.target.value)}
        className="text-[12px] min-h-[60px]" placeholder="Descrição para mecanismos de busca" />
    </FieldGroup>
    <TextInputField label="Separador do Título" themeKey="theme_seo_title_separator" theme={theme} onChange={onChange} placeholder=" | " />
    <TextInputField label="URL da Imagem OG" themeKey="theme_seo_og_image" theme={theme} onChange={onChange} placeholder="https://..." />
    <TextInputField label="URL do Favicon" themeKey="theme_seo_favicon" theme={theme} onChange={onChange} placeholder="/favicon.ico" />
    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] space-y-1">
      <p className="text-[10px] text-muted-foreground">Preview no Google</p>
      <p className="text-[14px] text-[hsl(210,100%,40%)]">{theme.theme_seo_site_title || "Nome da Loja"}</p>
      <p className="text-[12px] text-[hsl(120,50%,30%)]">sualoja.com.br</p>
      <p className="text-[11px] text-muted-foreground">{theme.theme_seo_site_description || "Descrição da loja..."}</p>
    </div>
  </>
);

const CustomCssSection = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>CSS Personalizado</SectionTitle>
    <p className="text-[11px] text-muted-foreground">
      Adicione CSS customizado para ajustes finos. As alterações são aplicadas em tempo real no preview.
    </p>
    <FieldGroup>
      <Textarea
        value={theme.theme_custom_css}
        onChange={(e) => onChange("theme_custom_css", e.target.value)}
        className="text-[12px] min-h-[200px] font-mono"
        placeholder={`/* Exemplo */\n.hero-section {\n  filter: grayscale(0.5);\n}\n\n.product-card:hover {\n  transform: scale(1.02);\n}`}
      />
    </FieldGroup>
    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
      <p className="text-[11px] text-amber-800">
        ⚠️ CSS personalizado é aplicado após todos os estilos do tema. Use com cuidado para não quebrar o layout.
      </p>
    </div>
  </>
);

// ─── Presets Section ──────────────────────────────────────
const PresetsSection = ({ theme, onApply }: { theme: Record<string, string>; onApply: (values: Record<string, string>) => void }) => {
  const hslToHexLocal = (h: number, s: number, l: number): string => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return (
    <>
      <SectionTitle>Presets de Tema</SectionTitle>
      <p className="text-[11px] text-muted-foreground">Escolha um tema base para começar. Você pode personalizar tudo depois.</p>
      <div className="space-y-3">
        {THEME_PRESETS.map((preset) => {
          const bgColor = hslToHexLocal(
            parseInt(preset.values.theme_bg_h || DEFAULTS.theme_bg_h),
            parseInt(preset.values.theme_bg_s || DEFAULTS.theme_bg_s),
            parseInt(preset.values.theme_bg_l || DEFAULTS.theme_bg_l),
          );
          const fgColor = hslToHexLocal(
            parseInt(preset.values.theme_fg_h || DEFAULTS.theme_fg_h),
            parseInt(preset.values.theme_fg_s || DEFAULTS.theme_fg_s),
            parseInt(preset.values.theme_fg_l || DEFAULTS.theme_fg_l),
          );
          const primaryColor = hslToHexLocal(
            parseInt(preset.values.theme_primary_h || DEFAULTS.theme_primary_h),
            parseInt(preset.values.theme_primary_s || DEFAULTS.theme_primary_s),
            parseInt(preset.values.theme_primary_l || DEFAULTS.theme_primary_l),
          );

          return (
            <button
              key={preset.name}
              onClick={() => onApply(preset.values)}
              className="w-full p-3 rounded-lg border border-[hsl(var(--admin-border))] hover:border-foreground/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  <div className="w-5 h-5 rounded-full border border-[hsl(var(--admin-border))]" style={{ backgroundColor: bgColor }} />
                  <div className="w-5 h-5 rounded-full border border-[hsl(var(--admin-border))]" style={{ backgroundColor: fgColor }} />
                  <div className="w-5 h-5 rounded-full border border-[hsl(var(--admin-border))]" style={{ backgroundColor: primaryColor }} />
                </div>
                <span className="text-[13px] font-medium">{preset.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{preset.description}</p>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {preset.values.theme_font_display || DEFAULTS.theme_font_display} / {preset.values.theme_font_body || DEFAULTS.theme_font_body}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

// ─── Section Types & Schemas (shared with AdminHomepage) ──
const SECTION_TYPES = [
  { value: "hero", label: "Hero Imersivo", icon: ImageIcon },
  { value: "large_hero", label: "Hero Grande", icon: ImageIcon },
  { value: "slideshow", label: "Slideshow", icon: Layers },
  { value: "asymmetric_grid", label: "Grid Assimétrico", icon: LayoutGrid },
  { value: "fifty_fifty", label: "50/50", icon: Columns },
  { value: "one_third_two_thirds", label: "1/3 + 2/3", icon: Columns },
  { value: "product_carousel", label: "Carrossel de Produtos", icon: ShoppingBag },
  { value: "editorial", label: "Editorial", icon: FileText },
  { value: "full_width_banner", label: "Banner Full Width", icon: ImageIcon },
  { value: "story", label: "Nossa História", icon: FileText },
  { value: "rich_text", label: "Texto Rico", icon: Type },
  { value: "newsletter", label: "Newsletter", icon: Mail },
  { value: "testimonials", label: "Depoimentos", icon: Star },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "multicolumn", label: "Multi-Colunas", icon: LayoutGrid },
  { value: "collapsible_content", label: "FAQ / Acordeão", icon: HelpCircle },
  { value: "contact_form", label: "Formulário de Contato", icon: MessageSquare },
  { value: "image_gallery", label: "Galeria de Imagens", icon: ImageIcon },
  { value: "separator", label: "Separador", icon: SeparatorHorizontal },
];

interface BlockFieldDef { key: string; label: string; type: "text" | "url" | "image"; }
interface SectionSchema {
  fields: { key: string; label: string; type: "text" | "textarea" | "image" | "url" }[];
  blocks?: { label: string; maxItems?: number; schema: BlockFieldDef[] };
}

const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    fields: [
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "text" },
      { key: "cta_text", label: "Texto do CTA", type: "text" },
      { key: "link_url", label: "Link do CTA", type: "url" },
      { key: "image_url", label: "Imagem de Fundo", type: "image" },
    ],
    blocks: { label: "Botões CTA", maxItems: 3, schema: [
      { key: "text", label: "Texto do Botão", type: "text" },
      { key: "link", label: "Link", type: "url" },
      { key: "style", label: "Estilo (primary/outline/text)", type: "text" },
    ]},
  },
  large_hero: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "image_url", label: "Imagem", type: "image" },
  ]},
  slideshow: { fields: [], blocks: { label: "Slides", maxItems: 8, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "heading", label: "Título", type: "text" },
    { key: "subheading", label: "Subtítulo", type: "text" },
    { key: "button_text", label: "Texto do Botão", type: "text" },
    { key: "button_link", label: "Link do Botão", type: "url" },
    { key: "text_position", label: "Posição (left/center/right)", type: "text" },
  ]}},
  asymmetric_grid: { fields: [
    { key: "title", label: "Título da Seção", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
  ], blocks: { label: "Cards do Grid", maxItems: 5, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "link", label: "Link", type: "url" },
  ]}},
  fifty_fifty: { fields: [], blocks: { label: "Items (2 colunas)", maxItems: 2, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Descrição", type: "text" },
    { key: "link", label: "Link", type: "url" },
  ]}},
  one_third_two_thirds: { fields: [], blocks: { label: "Items (1/3 + 2/3)", maxItems: 2, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Descrição", type: "text" },
    { key: "link", label: "Link", type: "url" },
  ]}},
  product_carousel: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "cta_text", label: "Texto do CTA", type: "text" },
    { key: "link_url", label: "Link do CTA", type: "url" },
  ]},
  editorial: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "cta_text", label: "Texto do CTA", type: "text" },
    { key: "link_url", label: "Link do CTA", type: "url" },
    { key: "image_url", label: "Imagem", type: "image" },
  ]},
  full_width_banner: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "cta_text", label: "Texto do CTA", type: "text" },
    { key: "link_url", label: "Link do CTA", type: "url" },
    { key: "image_url", label: "Imagem de Fundo", type: "image" },
  ], blocks: { label: "Botões CTA", maxItems: 3, schema: [
    { key: "text", label: "Texto do Botão", type: "text" },
    { key: "link", label: "Link", type: "url" },
    { key: "style", label: "Estilo (primary/outline/text)", type: "text" },
  ]}},
  story: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "cta_text", label: "Texto do CTA", type: "text" },
    { key: "link_url", label: "Link do CTA", type: "url" },
    { key: "image_url", label: "Imagem", type: "image" },
  ], blocks: { label: "Estatísticas / Números", maxItems: 4, schema: [
    { key: "number", label: "Número", type: "text" },
    { key: "label", label: "Descrição", type: "text" },
  ]}},
  rich_text: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Conteúdo", type: "textarea" },
  ]},
  newsletter: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Descrição", type: "text" },
    { key: "cta_text", label: "Texto do Botão", type: "text" },
  ]},
  testimonials: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
  ], blocks: { label: "Depoimentos", maxItems: 6, schema: [
    { key: "author", label: "Autor", type: "text" },
    { key: "quote", label: "Depoimento", type: "text" },
    { key: "rating", label: "Nota (1-5)", type: "text" },
    { key: "location", label: "Localização", type: "text" },
  ]}},
  video: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Descrição", type: "text" },
    { key: "image_url", label: "Imagem de Capa", type: "image" },
  ]},
  multicolumn: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
  ], blocks: { label: "Colunas", maxItems: 4, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Descrição", type: "text" },
    { key: "button_text", label: "Texto do Botão", type: "text" },
    { key: "button_link", label: "Link", type: "url" },
  ]}},
  collapsible_content: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
  ], blocks: { label: "Perguntas", maxItems: 20, schema: [
    { key: "question", label: "Pergunta", type: "text" },
    { key: "answer", label: "Resposta", type: "text" },
  ]}},
  contact_form: { fields: [
    { key: "title", label: "Título", type: "text" },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "cta_text", label: "Texto do Botão", type: "text" },
  ]},
  image_gallery: { fields: [
    { key: "title", label: "Título", type: "text" },
  ], blocks: { label: "Imagens", maxItems: 12, schema: [
    { key: "image", label: "Imagem", type: "image" },
    { key: "caption", label: "Legenda", type: "text" },
    { key: "link", label: "Link", type: "url" },
  ]}},
  separator: { fields: [] },
};

// ─── Sortable Section Item ────────────────────────────────
const SortableSectionItem = ({ section, onEdit, onToggle, onDelete }: {
  section: any; onEdit: (s: any) => void; onToggle: (s: any) => void; onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const typeInfo = SECTION_TYPES.find(t => t.value === section.section_type);

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2 px-2 py-2 hover:bg-[hsl(var(--admin-bg))] transition-colors rounded-lg group">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(section)}>
        <p className="text-[12px] font-medium text-foreground truncate">
          {section.title || typeInfo?.label || section.section_type}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{typeInfo?.label}</p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => onToggle(section)} className="p-1 rounded hover:bg-[hsl(var(--admin-surface))]">
          {section.is_visible
            ? <Eye className="h-3 w-3 text-[hsl(var(--admin-success))]" />
            : <EyeOff className="h-3 w-3 text-muted-foreground" />}
        </button>
        <button onClick={() => onDelete(section.id)}
          className="p-1 rounded hover:bg-[hsl(var(--admin-surface))] opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      </div>
    </div>
  );
};

// ─── Block Editor (inline) ────────────────────────────────
interface BlockData { [key: string]: string; }

const InlineBlockEditor = ({ blocks, schema, maxItems, onBlocksChange, onImageUpload, uploading }: {
  blocks: BlockData[];
  schema: BlockFieldDef[];
  maxItems?: number;
  onBlocksChange: (blocks: BlockData[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  uploading: boolean;
}) => {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(0);

  const addBlock = () => {
    if (maxItems && blocks.length >= maxItems) return;
    const newBlock: BlockData = {};
    schema.forEach(f => { newBlock[f.key] = ""; });
    onBlocksChange([...blocks, newBlock]);
    setExpandedBlock(blocks.length);
  };

  const removeBlock = (index: number) => {
    onBlocksChange(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, key: string, value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [key]: value };
    onBlocksChange(updated);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onBlocksChange(updated);
    setExpandedBlock(newIndex);
  };

  return (
    <div className="space-y-1.5">
      {blocks.map((block, index) => (
        <div key={index} className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[hsl(var(--admin-bg))] cursor-pointer"
            onClick={() => setExpandedBlock(expandedBlock === index ? null : index)}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground">#{index + 1}</span>
              <span className="text-[11px] font-medium text-foreground truncate">
                {block.title || block.text || block.author || block.heading || block.question || `Item ${index + 1}`}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {index > 0 && (
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); moveBlock(index, "up"); }}>
                  <ChevronUp className="h-2.5 w-2.5" />
                </Button>
              )}
              {index < blocks.length - 1 && (
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); moveBlock(index, "down"); }}>
                  <ChevronDown className="h-2.5 w-2.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={(e) => { e.stopPropagation(); removeBlock(index); }}>
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
              {expandedBlock === index ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            </div>
          </div>
          {expandedBlock === index && (
            <div className="p-2.5 space-y-2">
              {schema.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{field.label}</Label>
                  {field.type === "image" ? (
                    <div className="space-y-1.5">
                      <Input type="file" accept="image/*" disabled={uploading} className="h-7 text-[10px]"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await onImageUpload(file);
                            updateBlock(index, field.key, url);
                          } catch { toast.error("Erro ao enviar imagem"); }
                        }}
                      />
                      {block[field.key] && (
                        <img src={block[field.key]} alt="" className="w-12 h-12 object-cover rounded border border-[hsl(var(--admin-border))]" />
                      )}
                    </div>
                  ) : (
                    <Input value={block[field.key] || ""} onChange={(e) => updateBlock(index, field.key, e.target.value)}
                      className="h-7 text-[11px]" placeholder={field.label} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {(!maxItems || blocks.length < maxItems) && (
        <Button variant="outline" size="sm" onClick={addBlock} className="w-full h-7 text-[11px] rounded-lg">
          <Plus className="h-2.5 w-2.5 mr-1" /> Adicionar Item
        </Button>
      )}
    </div>
  );
};

// ─── Homepage Sections Panel (full editor) ────────────────
const HomepageSectionsPanel = ({ sections, iframeRef }: {
  sections: any[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) => {
  const updateSection = useUpdateSection();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const { upload } = useImageUpload();
  const [uploading, setUploading] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editBlocks, setEditBlocks] = useState<BlockData[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSections, setLocalSections] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setLocalSections([...sections].sort((a, b) => a.sort_order - b.sort_order));
  }, [sections]);

  const handleBlockImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const url = await upload(file);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const refreshIframe = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "theme-content-refresh" }, "*");
  };

  const openEdit = (s: any) => {
    const config = (s.config && typeof s.config === "object" && !Array.isArray(s.config)) ? s.config as Record<string, Json | undefined> : {};
    const blocks = Array.isArray(config.blocks) ? (config.blocks as BlockData[]) : [];
    setEditForm({
      title: s.title || "",
      subtitle: s.subtitle || "",
      description: s.description || "",
      cta_text: s.cta_text || "",
      link_url: s.link_url || "",
      image_url: s.image_url || "",
      image_url_2: s.image_url_2 || "",
      is_visible: s.is_visible,
      ...Object.fromEntries(
        Object.entries(config).filter(([k]) => k !== "blocks")
      ),
    });
    setEditBlocks(blocks);
    setEditingSection(s);
  };

  const handleSave = async () => {
    if (!editingSection) return;
    try {
      const config: Record<string, any> = {};
      const schema = SECTION_SCHEMAS[editingSection.section_type];
      // Preserve config fields that aren't direct table columns
      const originalConfig = (editingSection.config && typeof editingSection.config === "object") ? editingSection.config as Record<string, any> : {};
      Object.assign(config, originalConfig);
      if (editBlocks.length > 0) config.blocks = editBlocks;
      else delete config.blocks;
      // Copy non-table config fields from editForm
      for (const [k, v] of Object.entries(editForm)) {
        if (!["title", "subtitle", "description", "cta_text", "link_url", "image_url", "image_url_2", "is_visible"].includes(k)) {
          config[k] = v;
        }
      }
      await updateSection.mutateAsync({
        id: editingSection.id,
        title: editForm.title || null,
        subtitle: editForm.subtitle || null,
        description: editForm.description || null,
        cta_text: editForm.cta_text || null,
        link_url: editForm.link_url || null,
        image_url: editForm.image_url || null,
        image_url_2: editForm.image_url_2 || null,
        is_visible: editForm.is_visible,
        config: config as Json,
      });
      refreshIframe();
      toast.success("Seção salva!");
      setEditingSection(null);
    } catch {
      toast.error("Erro ao salvar seção");
    }
  };

  const handleToggle = async (s: any) => {
    await updateSection.mutateAsync({ id: s.id, is_visible: !s.is_visible });
    refreshIframe();
  };

  const handleDelete = async (id: string) => {
    await deleteSection.mutateAsync(id);
    refreshIframe();
    toast.success("Seção excluída");
  };

  const handleAddSection = async (typeValue: string) => {
    try {
      const result = await createSection.mutateAsync({
        section_type: typeValue,
        sort_order: localSections.length + 1,
        is_visible: true,
      });
      setAddDialogOpen(false);
      refreshIframe();
      // Open the newly created section for editing
      if (result) openEdit(result);
    } catch {
      toast.error("Erro ao criar seção");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localSections.findIndex(s => s.id === active.id);
    const newIndex = localSections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(localSections, oldIndex, newIndex);
    setLocalSections(reordered);
    // Persist new sort orders
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await updateSection.mutateAsync({ id: reordered[i].id, sort_order: i });
      }
    }
    refreshIframe();
  };

  const filteredTypes = SECTION_TYPES.filter(t =>
    t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Edit Mode ──
  if (editingSection) {
    const schema = SECTION_SCHEMAS[editingSection.section_type];
    const typeInfo = SECTION_TYPES.find(t => t.value === editingSection.section_type);
    return (
      <>
        <button onClick={() => setEditingSection(null)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar à lista
        </button>
        <SectionTitle>{typeInfo?.label || editingSection.section_type}</SectionTitle>
        <div className="space-y-3 mt-3">
          {schema?.fields.map(field => (
            <div key={field.key} className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea value={editForm[field.key] || ""} onChange={(e) => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="text-[11px] min-h-[60px]" placeholder={field.label} />
              ) : field.type === "image" ? (
                <div className="space-y-1.5">
                  <Input type="file" accept="image/*" disabled={uploading} className="h-7 text-[10px]"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const url = await upload(file);
                        setEditForm(f => ({ ...f, [field.key]: url }));
                      } catch { toast.error("Erro ao enviar imagem"); }
                      setUploading(false);
                    }}
                  />
                  {editForm[field.key] && (
                    <img src={editForm[field.key]} alt="" className="w-14 h-14 object-cover rounded border border-[hsl(var(--admin-border))]" />
                  )}
                </div>
              ) : (
                <Input value={editForm[field.key] || ""} onChange={(e) => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="h-7 text-[11px]" placeholder={field.label} />
              )}
            </div>
          ))}

          {/* Visibility toggle */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-[11px] text-muted-foreground">Visível</Label>
            <Switch checked={editForm.is_visible !== false} onCheckedChange={(v) => setEditForm(f => ({ ...f, is_visible: v }))} />
          </div>

          {/* Blocks */}
          {schema?.blocks && (
            <div className="space-y-2">
              <Label className="text-[11px] text-muted-foreground font-medium">{schema.blocks.label}</Label>
              <InlineBlockEditor
                blocks={editBlocks}
                schema={schema.blocks.schema}
                maxItems={schema.blocks.maxItems}
                onBlocksChange={setEditBlocks}
                onImageUpload={handleBlockImageUpload}
                uploading={uploading}
              />
            </div>
          )}

          <Button size="sm" className="w-full h-8 text-[12px] rounded-lg mt-2" onClick={handleSave}
            disabled={updateSection.isPending}>
            <Save className="h-3 w-3 mr-1" />
            {updateSection.isPending ? "Salvando..." : "Salvar Seção"}
          </Button>
        </div>
      </>
    );
  }

  // ── List Mode ──
  return (
    <>
      <SectionTitle>Seções da Homepage</SectionTitle>

      {/* Page selector */}
      <div className="mt-2">
        <Label className="text-[10px] text-muted-foreground">Página</Label>
        <Select defaultValue="index" onValueChange={(val) => {
          const urls: Record<string, string> = { index: "/", product: "/product/1", collection: "/category/shop" };
          iframeRef.current?.setAttribute("src", urls[val] || "/");
        }}>
          <SelectTrigger className="h-7 text-[11px] mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="index">Página Inicial</SelectItem>
            <SelectItem value="product">Página de Produto</SelectItem>
            <SelectItem value="collection">Página de Categoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drag-and-drop list */}
      <div className="mt-3 border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
        {localSections.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-muted-foreground">Nenhuma seção configurada.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {localSections.map(s => (
                <SortableSectionItem key={s.id} section={s} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add section button */}
      <Button variant="outline" size="sm" className="w-full h-8 text-[11px] rounded-lg mt-2" onClick={() => setAddDialogOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adicionar Seção
      </Button>

      {/* Add section dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Adicionar Seção</DialogTitle>
          </DialogHeader>
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tipo de seção..." className="h-8 text-[12px] mb-3" />
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
            {filteredTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <button key={type.value} onClick={() => handleAddSection(type.value)}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[hsl(var(--admin-border))] hover:border-foreground/30 hover:bg-[hsl(var(--admin-bg))] transition-colors text-left">
                  <IconComponent className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-[12px] font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminThemeEditor;
