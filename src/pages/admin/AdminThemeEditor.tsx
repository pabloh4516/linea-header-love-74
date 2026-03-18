import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { useHomepageSections, useUpdateSection, useCreateSection, useDeleteSection } from "@/hooks/useHomepageSections";
import { useImageUpload } from "@/hooks/useImageUpload";
import { usePageTemplate, useSavePageTemplate } from "@/hooks/usePageTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Save, Monitor, Smartphone, Tablet, RotateCcw, Palette, Type, Layout, Square,
  ChevronLeft, ChevronRight, Image as ImageIcon, ShoppingBag, CreditCard,
  Globe, Menu, AlignCenter, Layers, Eye, EyeOff, ArrowUp, Megaphone, Grid3X3, Search,
  Share2, Code, MousePointer, Sparkles, Home, Plus, Trash2, GripVertical, ArrowLeft,
  ChevronDown, ChevronUp, FileText, Video, MessageSquare, Mail, Columns, HelpCircle,
  SeparatorHorizontal, Star, LayoutGrid, Settings, Shield, Tag, Hash,
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
  theme_primary_h: "30", theme_primary_s: "5", theme_primary_l: "8",
  theme_bg_h: "30", theme_bg_s: "10", theme_bg_l: "98",
  theme_fg_h: "30", theme_fg_s: "5", theme_fg_l: "8",
  theme_accent_h: "35", theme_accent_s: "30", theme_accent_l: "90",
  theme_muted_h: "30", theme_muted_s: "8", theme_muted_l: "95",
  theme_border_h: "30", theme_border_s: "8", theme_border_l: "88",
  theme_destructive_h: "0", theme_destructive_s: "84", theme_destructive_l: "60",
  theme_font_display: "DM Sans", theme_font_body: "DM Sans",
  theme_font_size_base: "16", theme_heading_weight: "300", theme_body_weight: "300",
  theme_letter_spacing_editorial: "0.05",
  theme_border_radius: "0.375", theme_spacing_section: "96", theme_max_width: "1440",
  theme_button_style: "solid", theme_button_radius: "0", theme_button_height: "52",
  theme_button_font_size: "12", theme_button_letter_spacing: "0.15", theme_button_font_weight: "300",
  theme_statusbar_bg_h: "30", theme_statusbar_bg_s: "5", theme_statusbar_bg_l: "8",
  theme_statusbar_fg_h: "30", theme_statusbar_fg_s: "10", theme_statusbar_fg_l: "98",
  theme_statusbar_visible: "true", theme_statusbar_height: "36", theme_statusbar_font_size: "10",
  theme_statusbar_text_1: "Frete grátis acima de R$250",
  theme_statusbar_text_2: "Garantia de 365 dias",
  theme_statusbar_text_3: "+100.000 clientes satisfeitos",
  theme_statusbar_rotation_speed: "3000",
  theme_nav_bg_h: "30", theme_nav_bg_s: "10", theme_nav_bg_l: "98",
  theme_nav_fg_h: "30", theme_nav_fg_s: "5", theme_nav_fg_l: "20",
  theme_nav_height: "64", theme_nav_logo_height: "24", theme_nav_style: "centered",
  theme_nav_sticky: "true", theme_nav_transparent_hero: "false",
  theme_nav_show_search: "true", theme_nav_show_wishlist: "true",
  theme_card_aspect: "3/4", theme_card_hover_effect: "zoom",
  theme_card_show_category: "true", theme_card_show_badge: "true",
  theme_card_badge_style: "filled", theme_card_price_weight: "300",
  theme_card_name_size: "14", theme_card_gap: "16",
  theme_card_columns_desktop: "3", theme_card_columns_mobile: "2",
  theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "scroll",
  theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "true",
  theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "true",
  theme_pdp_image_aspect: "3/4", theme_pdp_sticky_info: "true",
  theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
  theme_category_layout: "standard", theme_category_show_header: "true",
  theme_category_show_filters: "true", theme_category_filter_position: "top",
  theme_category_show_count: "true", theme_category_products_per_page: "12",
  theme_category_show_sort: "true",
  theme_cart_style: "drawer", theme_cart_width: "384",
  theme_cart_show_thumbnails: "true", theme_cart_show_quantity: "true",
  theme_cart_show_continue: "true", theme_cart_show_subtotal: "true",
  theme_cart_cta_text: "Finalizar Compra",
  theme_footer_bg_h: "30", theme_footer_bg_s: "5", theme_footer_bg_l: "8",
  theme_footer_fg_h: "30", theme_footer_fg_s: "10", theme_footer_fg_l: "98",
  theme_footer_layout: "two-column", theme_footer_show_social: "true",
  theme_footer_show_newsletter: "false",
  theme_footer_tagline: "Joias minimalistas feitas para o indivíduo moderno",
  theme_footer_address_line1: "Rua Oscar Freire, 123",
  theme_footer_address_line2: "São Paulo, SP 01426-001",
  theme_footer_phone: "+55 (11) 3456-7890",
  theme_footer_email: "contato@lineajewelry.com.br",
  theme_footer_copyright: "© 2024 Linea. Todos os direitos reservados.",
  theme_footer_show_payment_icons: "false",
  theme_social_instagram: "", theme_social_pinterest: "", theme_social_facebook: "",
  theme_social_tiktok: "", theme_social_twitter: "", theme_social_youtube: "",
  theme_seo_site_title: "Linea Jewelry",
  theme_seo_site_description: "Joias minimalistas feitas para o indivíduo moderno",
  theme_seo_og_image: "", theme_seo_favicon: "", theme_seo_title_separator: " | ",
  theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
  theme_checkout_show_order_bumps: "true", theme_checkout_show_coupon: "true",
  theme_checkout_trust_text: "Pagamento 100% seguro",
  theme_animation_enabled: "true", theme_animation_intensity: "medium",
  theme_hover_scale: "1.05", theme_transition_speed: "700", theme_overlay_opacity: "0.05",
  theme_custom_css: "",
};

const THEME_KEYS = Object.keys(DEFAULTS);

// ─── Theme Presets ────────────────────────────────────────
interface ThemePreset { name: string; description: string; values: Record<string, string>; }

const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Minimal", description: "Clean, espaçoso, tipografia leve — layout arejado e minimalista",
    values: {
      theme_primary_h: "0", theme_primary_s: "0", theme_primary_l: "10",
      theme_bg_h: "0", theme_bg_s: "0", theme_bg_l: "100",
      theme_fg_h: "0", theme_fg_s: "0", theme_fg_l: "10",
      theme_accent_h: "0", theme_accent_s: "0", theme_accent_l: "95",
      theme_muted_h: "0", theme_muted_s: "0", theme_muted_l: "96",
      theme_border_h: "0", theme_border_s: "0", theme_border_l: "90",
      theme_font_display: "DM Sans", theme_font_body: "DM Sans",
      theme_heading_weight: "300", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.08",
      theme_border_radius: "0", theme_spacing_section: "112", theme_max_width: "1440",
      theme_button_style: "outline", theme_button_radius: "0",
      theme_button_height: "48", theme_button_font_size: "11",
      theme_button_letter_spacing: "0.2", theme_button_font_weight: "300",
      theme_statusbar_bg_h: "0", theme_statusbar_bg_s: "0", theme_statusbar_bg_l: "10",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "32", theme_statusbar_font_size: "10",
      theme_nav_bg_h: "0", theme_nav_bg_s: "0", theme_nav_bg_l: "100",
      theme_nav_fg_h: "0", theme_nav_fg_s: "0", theme_nav_fg_l: "10",
      theme_nav_height: "60", theme_nav_logo_height: "20",
      theme_nav_style: "centered", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "false",
      theme_nav_show_search: "false", theme_nav_show_wishlist: "false",
      theme_card_aspect: "3/4", theme_card_hover_effect: "fade",
      theme_card_show_category: "false", theme_card_show_badge: "false",
      theme_card_badge_style: "outline", theme_card_price_weight: "300",
      theme_card_name_size: "13", theme_card_gap: "24",
      theme_card_columns_desktop: "3", theme_card_columns_mobile: "2",
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "false",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "false",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      theme_category_layout: "standard", theme_category_show_filters: "false",
      theme_category_show_count: "false", theme_category_show_sort: "false",
      theme_cart_style: "drawer", theme_cart_width: "360",
      theme_footer_bg_h: "0", theme_footer_bg_s: "0", theme_footer_bg_l: "10",
      theme_footer_fg_h: "0", theme_footer_fg_s: "0", theme_footer_fg_l: "95",
      theme_footer_layout: "minimal", theme_footer_show_social: "false",
      theme_footer_show_newsletter: "false", theme_footer_show_payment_icons: "false",
      theme_animation_enabled: "true", theme_animation_intensity: "subtle",
      theme_hover_scale: "1.02", theme_transition_speed: "500", theme_overlay_opacity: "0.03",
      theme_checkout_style: "single-page", theme_checkout_show_trust: "false",
    },
  },
  {
    name: "Luxo", description: "Elegante, tons dourados, serif refinada — experiência premium",
    values: {
      theme_primary_h: "38", theme_primary_s: "60", theme_primary_l: "45",
      theme_bg_h: "30", theme_bg_s: "15", theme_bg_l: "97",
      theme_fg_h: "30", theme_fg_s: "10", theme_fg_l: "12",
      theme_accent_h: "38", theme_accent_s: "40", theme_accent_l: "90",
      theme_muted_h: "30", theme_muted_s: "10", theme_muted_l: "94",
      theme_border_h: "30", theme_border_s: "15", theme_border_l: "85",
      theme_font_display: "Cormorant Garamond", theme_font_body: "Raleway",
      theme_heading_weight: "400", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.06",
      theme_border_radius: "0", theme_spacing_section: "96", theme_max_width: "1440",
      theme_button_style: "solid", theme_button_radius: "0",
      theme_button_height: "52", theme_button_font_size: "11",
      theme_button_letter_spacing: "0.18", theme_button_font_weight: "400",
      theme_statusbar_bg_h: "38", theme_statusbar_bg_s: "60", theme_statusbar_bg_l: "45",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "36", theme_statusbar_font_size: "10",
      theme_nav_bg_h: "30", theme_nav_bg_s: "15", theme_nav_bg_l: "97",
      theme_nav_fg_h: "30", theme_nav_fg_s: "10", theme_nav_fg_l: "12",
      theme_nav_height: "72", theme_nav_logo_height: "28",
      theme_nav_style: "centered", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "true",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "true",
      theme_card_aspect: "4/5", theme_card_hover_effect: "zoom",
      theme_card_show_category: "true", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "400",
      theme_card_name_size: "14", theme_card_gap: "20",
      theme_card_columns_desktop: "3", theme_card_columns_mobile: "2",
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "thumbnails",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "true",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      theme_category_layout: "editorial", theme_category_show_filters: "true",
      theme_category_filter_position: "top",
      theme_category_show_count: "true", theme_category_show_sort: "true",
      theme_category_products_per_page: "12",
      theme_cart_style: "drawer", theme_cart_width: "420",
      theme_footer_bg_h: "30", theme_footer_bg_s: "10", theme_footer_bg_l: "8",
      theme_footer_fg_h: "30", theme_footer_fg_s: "15", theme_footer_fg_l: "90",
      theme_footer_layout: "three-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "true", theme_footer_show_payment_icons: "true",
      theme_animation_enabled: "true", theme_animation_intensity: "medium",
      theme_hover_scale: "1.05", theme_transition_speed: "700", theme_overlay_opacity: "0.05",
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
      theme_checkout_show_order_bumps: "true", theme_checkout_show_coupon: "true",
    },
  },
  {
    name: "Moderno", description: "Contemporâneo, arrojado, cantos arredondados — tech-forward",
    values: {
      theme_primary_h: "220", theme_primary_s: "15", theme_primary_l: "15",
      theme_bg_h: "220", theme_bg_s: "5", theme_bg_l: "98",
      theme_fg_h: "220", theme_fg_s: "15", theme_fg_l: "10",
      theme_accent_h: "220", theme_accent_s: "20", theme_accent_l: "92",
      theme_muted_h: "220", theme_muted_s: "8", theme_muted_l: "95",
      theme_border_h: "220", theme_border_s: "10", theme_border_l: "88",
      theme_font_display: "Montserrat", theme_font_body: "Inter",
      theme_heading_weight: "600", theme_body_weight: "400",
      theme_letter_spacing_editorial: "0.03",
      theme_border_radius: "0.75", theme_spacing_section: "80", theme_max_width: "1280",
      theme_button_style: "solid", theme_button_radius: "8",
      theme_button_height: "48", theme_button_font_size: "13",
      theme_button_letter_spacing: "0.05", theme_button_font_weight: "500",
      theme_statusbar_bg_h: "220", theme_statusbar_bg_s: "15", theme_statusbar_bg_l: "15",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "100",
      theme_statusbar_visible: "true", theme_statusbar_height: "36", theme_statusbar_font_size: "11",
      theme_nav_bg_h: "220", theme_nav_bg_s: "5", theme_nav_bg_l: "98",
      theme_nav_fg_h: "220", theme_nav_fg_s: "15", theme_nav_fg_l: "10",
      theme_nav_height: "64", theme_nav_logo_height: "24",
      theme_nav_style: "left-aligned", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "false",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "true",
      theme_card_aspect: "square", theme_card_hover_effect: "slide",
      theme_card_show_category: "true", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "500",
      theme_card_name_size: "14", theme_card_gap: "16",
      theme_card_columns_desktop: "4", theme_card_columns_mobile: "2",
      theme_pdp_layout: "side-by-side", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "true", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "true",
      theme_pdp_sticky_info: "true", theme_pdp_show_related: "true", theme_pdp_show_sku: "true",
      theme_category_layout: "masonry", theme_category_show_filters: "true",
      theme_category_filter_position: "sidebar",
      theme_category_show_count: "true", theme_category_show_sort: "true",
      theme_category_products_per_page: "16",
      theme_cart_style: "drawer", theme_cart_width: "400",
      theme_footer_bg_h: "220", theme_footer_bg_s: "15", theme_footer_bg_l: "10",
      theme_footer_fg_h: "220", theme_footer_fg_s: "5", theme_footer_fg_l: "90",
      theme_footer_layout: "three-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "true", theme_footer_show_payment_icons: "true",
      theme_animation_enabled: "true", theme_animation_intensity: "medium",
      theme_hover_scale: "1.05", theme_transition_speed: "600", theme_overlay_opacity: "0.06",
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
      theme_checkout_show_order_bumps: "true",
    },
  },
  {
    name: "Bold", description: "Ousado, modo escuro, impactante — drama e contraste máximo",
    values: {
      theme_primary_h: "0", theme_primary_s: "0", theme_primary_l: "95",
      theme_bg_h: "0", theme_bg_s: "0", theme_bg_l: "5",
      theme_fg_h: "0", theme_fg_s: "0", theme_fg_l: "95",
      theme_accent_h: "0", theme_accent_s: "0", theme_accent_l: "15",
      theme_muted_h: "0", theme_muted_s: "0", theme_muted_l: "12",
      theme_border_h: "0", theme_border_s: "0", theme_border_l: "20",
      theme_font_display: "Playfair Display", theme_font_body: "DM Sans",
      theme_heading_weight: "700", theme_body_weight: "300",
      theme_letter_spacing_editorial: "0.04",
      theme_border_radius: "0", theme_spacing_section: "80", theme_max_width: "1600",
      theme_button_style: "solid", theme_button_radius: "0",
      theme_button_height: "56", theme_button_font_size: "13",
      theme_button_letter_spacing: "0.12", theme_button_font_weight: "500",
      theme_statusbar_bg_h: "0", theme_statusbar_bg_s: "0", theme_statusbar_bg_l: "95",
      theme_statusbar_fg_h: "0", theme_statusbar_fg_s: "0", theme_statusbar_fg_l: "5",
      theme_statusbar_visible: "true", theme_statusbar_height: "40", theme_statusbar_font_size: "11",
      theme_nav_bg_h: "0", theme_nav_bg_s: "0", theme_nav_bg_l: "5",
      theme_nav_fg_h: "0", theme_nav_fg_s: "0", theme_nav_fg_l: "95",
      theme_nav_height: "72", theme_nav_logo_height: "26",
      theme_nav_style: "left-aligned", theme_nav_sticky: "true",
      theme_nav_transparent_hero: "true",
      theme_nav_show_search: "true", theme_nav_show_wishlist: "false",
      theme_card_aspect: "3/4", theme_card_hover_effect: "zoom",
      theme_card_show_category: "false", theme_card_show_badge: "true",
      theme_card_badge_style: "filled", theme_card_price_weight: "500",
      theme_card_name_size: "15", theme_card_gap: "12",
      theme_card_columns_desktop: "2", theme_card_columns_mobile: "1",
      theme_pdp_layout: "stacked", theme_pdp_gallery_style: "scroll",
      theme_pdp_show_breadcrumb: "false", theme_pdp_show_editor_notes: "true",
      theme_pdp_show_details_grid: "true", theme_pdp_show_trust_badges: "false",
      theme_pdp_sticky_info: "false", theme_pdp_show_related: "true", theme_pdp_show_sku: "false",
      theme_category_layout: "highlight", theme_category_show_filters: "false",
      theme_category_show_count: "false", theme_category_show_sort: "true",
      theme_category_products_per_page: "8",
      theme_cart_style: "drawer", theme_cart_width: "440",
      theme_footer_bg_h: "0", theme_footer_bg_s: "0", theme_footer_bg_l: "3",
      theme_footer_fg_h: "0", theme_footer_fg_s: "0", theme_footer_fg_l: "80",
      theme_footer_layout: "two-column", theme_footer_show_social: "true",
      theme_footer_show_newsletter: "false", theme_footer_show_payment_icons: "false",
      theme_animation_enabled: "true", theme_animation_intensity: "dramatic",
      theme_hover_scale: "1.08", theme_transition_speed: "800", theme_overlay_opacity: "0.08",
      theme_checkout_style: "single-page", theme_checkout_show_trust: "true",
    },
  },
];

// ─── Page Options ─────────────────────────────────────────
type EditorPage = "index" | "product" | "collection" | "cart" | "checkout" | "our-story" | "sustainability" | "size-guide" | "customer-care" | "store-locator" | "privacy" | "terms";

interface PageOption { value: EditorPage; label: string; url: string; group: string; }

const PAGE_OPTIONS: PageOption[] = [
  { value: "index", label: "Página Inicial", url: "/", group: "Principal" },
  { value: "product", label: "Página de Produto", url: "/product/1", group: "Principal" },
  { value: "collection", label: "Página de Categoria", url: "/category/shop", group: "Principal" },
  { value: "cart", label: "Carrinho", url: "/cart", group: "Principal" },
  { value: "checkout", label: "Checkout", url: "/checkout", group: "Principal" },
  { value: "our-story", label: "Nossa História", url: "/about/our-story", group: "Sobre" },
  { value: "sustainability", label: "Sustentabilidade", url: "/about/sustainability", group: "Sobre" },
  { value: "size-guide", label: "Guia de Tamanhos", url: "/about/size-guide", group: "Sobre" },
  { value: "customer-care", label: "Atendimento", url: "/about/customer-care", group: "Sobre" },
  { value: "store-locator", label: "Nossas Lojas", url: "/about/store-locator", group: "Sobre" },
  { value: "privacy", label: "Política de Privacidade", url: "/privacy-policy", group: "Legal" },
  { value: "terms", label: "Termos de Serviço", url: "/terms-of-service", group: "Legal" },
];

// ─── Theme Settings Groups (for "Configurações" tab) ──────
type SettingsGroupId = "presets" | "colors" | "typography" | "layout" | "buttons" | "effects"
  | "product_card" | "product_page" | "category" | "cart" | "checkout" | "social" | "seo" | "custom_css";

interface SettingsGroupDef {
  id: SettingsGroupId;
  label: string;
  icon: typeof Palette;
  group: string;
}

const SETTINGS_GROUPS: SettingsGroupDef[] = [
  { id: "presets", label: "Presets de Tema", icon: Sparkles, group: "Início Rápido" },
  { id: "colors", label: "Cores", icon: Palette, group: "Design" },
  { id: "typography", label: "Tipografia", icon: Type, group: "Design" },
  { id: "layout", label: "Layout & Espaçamento", icon: Layout, group: "Design" },
  { id: "buttons", label: "Botões", icon: Square, group: "Design" },
  { id: "effects", label: "Animações & Efeitos", icon: Layers, group: "Design" },
  { id: "product_card", label: "Card de Produto", icon: ShoppingBag, group: "Componentes" },
  { id: "product_page", label: "Página de Produto", icon: Eye, group: "Componentes" },
  { id: "category", label: "Página de Categoria", icon: Grid3X3, group: "Componentes" },
  { id: "cart", label: "Carrinho / Sacola", icon: ShoppingBag, group: "Componentes" },
  { id: "checkout", label: "Checkout", icon: CreditCard, group: "Componentes" },
  { id: "social", label: "Redes Sociais", icon: Share2, group: "Configurações" },
  { id: "seo", label: "SEO & Meta Tags", icon: Search, group: "Configurações" },
  { id: "custom_css", label: "CSS Personalizado", icon: Code, group: "Configurações" },
];

// Map iframe section clicks to sidebar navigation
const INLINE_SECTION_MAP: Record<string, { tab: "sections" | "settings"; target: string }> = {
  statusbar: { tab: "sections", target: "header" },
  navigation: { tab: "sections", target: "header" },
  header: { tab: "sections", target: "header" },
  footer: { tab: "sections", target: "footer" },
  hero: { tab: "settings", target: "colors" },
  "product-grid": { tab: "settings", target: "product_card" },
  "product-carousel": { tab: "settings", target: "product_card" },
  "product-detail": { tab: "settings", target: "product_page" },
  category: { tab: "settings", target: "category" },
  cart: { tab: "settings", target: "cart" },
  checkout: { tab: "settings", target: "checkout" },
};

type Viewport = "desktop" | "tablet" | "mobile";

// ─── Inline editing script injected into iframe ───────────
const INLINE_EDIT_SCRIPT = `
(function() {
  if (window.__themeEditorReady) return;
  window.__themeEditorReady = true;
  let overlay = document.createElement('div');
  overlay.id = '__theme-overlay';
  overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid hsl(210,100%,52%);background:hsla(210,100%,52%,0.05);transition:all 0.15s ease;opacity:0;border-radius:2px;';
  document.body.appendChild(overlay);
  let label = document.createElement('div');
  label.id = '__theme-label';
  label.style.cssText = 'position:fixed;z-index:100000;pointer-events:none;background:hsl(210,100%,52%);color:white;font-size:11px;font-family:system-ui;padding:2px 8px;border-radius:2px;opacity:0;transition:opacity 0.15s;white-space:nowrap;';
  document.body.appendChild(label);
  const SECTION_LABELS = {
    statusbar:'Barra de Anúncio',navigation:'Navegação',header:'Cabeçalho',footer:'Rodapé',
    hero:'Hero','product-grid':'Grid de Produtos','product-carousel':'Carrossel de Produtos',
    'product-detail':'Página de Produto','full-width-banner':'Banner Full Width',
    'story-section':'Seção de História','asymmetric-grid':'Grid Assimétrico',
    category:'Página de Categoria',cart:'Carrinho',checkout:'Checkout',
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
      overlay.style.top = rect.top + 'px'; overlay.style.left = rect.left + 'px';
      overlay.style.width = rect.width + 'px'; overlay.style.height = rect.height + 'px';
      overlay.style.opacity = '1';
      let name = sec.dataset.themeSection;
      label.textContent = (SECTION_LABELS[name] || name) + ' — Clique para editar';
      label.style.top = Math.max(0, rect.top - 24) + 'px';
      label.style.left = rect.left + 'px'; label.style.opacity = '1';
    } else { overlay.style.opacity = '0'; label.style.opacity = '0'; }
  });
  document.addEventListener('mouseleave', function() { overlay.style.opacity = '0'; label.style.opacity = '0'; });
  document.addEventListener('click', function(e) {
    let sec = getSection(e.target);
    if (sec) { e.preventDefault(); e.stopPropagation();
      window.parent.postMessage({ type: 'theme-section-click', section: sec.dataset.themeSection }, '*');
    }
  }, true);
})();
`;

// ─── Section Types & Schemas from Theme Registry ──────────
import { themeRegistry } from "@/theme-engine";
import SchemaField from "@/components/admin/SchemaField";

const getSectionTypes = () => {
  const available = themeRegistry.getAvailableSections();
  const iconMap: Record<string, typeof ImageIcon> = {
    ImageIcon, Layers, LayoutGrid, Columns, ShoppingBag, FileText, Type, Mail,
    Star, Video, HelpCircle, MessageSquare, SeparatorHorizontal,
  };
  return available.map(s => ({
    value: s.type,
    label: s.name,
    icon: iconMap[s.icon || ""] || LayoutGrid,
  }));
};

const SECTION_TYPES = getSectionTypes();

// Legacy adapter: convert new SectionSchema to old format for existing code
interface BlockFieldDef { key: string; label: string; type: "text" | "url" | "image"; }
interface LegacySectionSchema {
  fields: { key: string; label: string; type: "text" | "textarea" | "image" | "url" }[];
  blocks?: { label: string; maxItems?: number; schema: BlockFieldDef[] };
}

function getLegacySchema(sectionType: string): LegacySectionSchema | undefined {
  const schema = themeRegistry.getSectionSchema(sectionType);
  if (!schema) return undefined;
  const fields = schema.settings.map(s => ({
    key: s.id,
    label: s.label,
    type: (s.type === "textarea" || s.type === "richtext" ? "textarea" : s.type === "image" ? "image" : s.type === "url" ? "url" : "text") as "text" | "textarea" | "image" | "url",
  }));
  const block = schema.blocks?.[0];
  const blocks = block ? {
    label: block.name,
    maxItems: block.limit,
    schema: block.settings.map(s => ({
      key: s.id,
      label: s.label,
      type: (s.type === "image" ? "image" : s.type === "url" ? "url" : "text") as "text" | "url" | "image",
    })),
  } : undefined;
  return { fields, blocks };
}

const SECTION_SCHEMAS: Record<string, LegacySectionSchema> = new Proxy({} as any, {
  get: (_target, prop: string) => getLegacySchema(prop),
});

// ─── Product Info Named Blocks ────────────────────────────
const PRODUCT_INFO_BLOCK_TYPES = [
  { type: "breadcrumb", label: "Breadcrumb", icon: ChevronRight },
  { type: "title", label: "Título do Produto", icon: Type },
  { type: "price", label: "Preço", icon: Tag },
  { type: "variant_selector", label: "Seletor de Variantes", icon: Layers },
  { type: "quantity_selector", label: "Seletor de Quantidade", icon: Plus },
  { type: "add_to_cart", label: "Botão Comprar", icon: ShoppingBag },
  { type: "details_grid", label: "Detalhes do Produto", icon: Grid3X3 },
  { type: "editor_notes", label: "Notas do Editor", icon: Star },
  { type: "sku", label: "SKU", icon: Hash },
  { type: "trust_badges", label: "Selos de Confiança", icon: Shield },
  { type: "description", label: "Descrição / Acordeão", icon: FileText },
];

interface ProductInfoBlock {
  type: string;
  visible: boolean;
}

const DEFAULT_PRODUCT_INFO_BLOCKS: ProductInfoBlock[] = [
  { type: "breadcrumb", visible: true },
  { type: "title", visible: true },
  { type: "price", visible: true },
  { type: "sku", visible: false },
  { type: "details_grid", visible: true },
  { type: "editor_notes", visible: true },
  { type: "quantity_selector", visible: true },
  { type: "add_to_cart", visible: true },
  { type: "trust_badges", visible: true },
  { type: "description", visible: true },
];

// ─── Available section types per page ─────────────────────
const PAGE_AVAILABLE_SECTIONS: Record<EditorPage, string[]> = {
  index: SECTION_TYPES.map(t => t.value),
  product: ["product_info", "product_gallery", "product_recommendations", "product_carousel", "rich_text", "newsletter", "testimonials", "collapsible_content", "video", "multicolumn", "full_width_banner", "editorial", "separator", "contact_form"],
  collection: ["rich_text", "newsletter", "full_width_banner", "product_carousel", "editorial", "separator", "testimonials", "video"],
  cart: ["product_carousel", "rich_text", "newsletter", "full_width_banner", "separator", "testimonials"],
  checkout: ["rich_text", "separator"],
  "our-story": SECTION_TYPES.map(t => t.value),
  sustainability: SECTION_TYPES.map(t => t.value),
  "size-guide": SECTION_TYPES.map(t => t.value),
  "customer-care": SECTION_TYPES.map(t => t.value),
  "store-locator": SECTION_TYPES.map(t => t.value),
  privacy: ["rich_text", "separator", "contact_form"],
  terms: ["rich_text", "separator", "contact_form"],
};

// Map EditorPage to page_templates page_type
const PAGE_TYPE_MAP: Record<EditorPage, string> = {
  index: "homepage",
  product: "product",
  collection: "collection",
  cart: "cart",
  checkout: "checkout",
  "our-story": "our-story",
  sustainability: "sustainability",
  "size-guide": "size-guide",
  "customer-care": "customer-care",
  "store-locator": "store-locator",
  privacy: "privacy",
  terms: "terms",
};

// ═══════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const AdminThemeEditor = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const { data: homepageSections } = useHomepageSections();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inlineEditMode, setInlineEditMode] = useState(true);
  const [selectedPage, setSelectedPage] = useState<EditorPage>("index");

  // Two sidebar modes: "sections" | "settings"
  const [sidebarMode, setSidebarMode] = useState<"sections" | "settings">("sections");

  // Drill-down state for sections tab
  // null = list view, "header" | "footer" | section-id = detail view
  const [sectionDrilldown, setSectionDrilldown] = useState<string | null>(null);

  // Drill-down state for settings tab
  const [settingsDrilldown, setSettingsDrilldown] = useState<string | number | null>(null);

  useEffect(() => {
    if (settings) {
      const merged = { ...DEFAULTS };
      // Load all theme_ keys from settings, not just THEME_KEYS
      Object.keys(settings).forEach(key => {
        if (key.startsWith("theme_")) merged[key] = settings[key];
      });
      THEME_KEYS.forEach(key => {
        if (settings[key] && !merged[key]) merged[key] = settings[key];
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
          setSidebarMode(mapped.tab);
          if (mapped.tab === "sections") {
            setSectionDrilldown(mapped.target);
          } else {
            setSettingsDrilldown(mapped.target as SettingsGroupId);
          }
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
      // Save all theme_ keys that changed
      const allThemeKeys = Object.keys(theme).filter(k => k.startsWith("theme_"));
      const changed = allThemeKeys.filter(key => theme[key] !== (settings?.[key] ?? DEFAULTS[key] ?? ""));
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

  const handlePageChange = (page: EditorPage) => {
    setSelectedPage(page);
    const pageOpt = PAGE_OPTIONS.find(p => p.value === page);
    if (pageOpt) iframeRef.current?.setAttribute("src", pageOpt.url);
    // Reset drilldown when changing page
    setSectionDrilldown(null);
  };

  const pageGroups = PAGE_OPTIONS.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {} as Record<string, PageOption[]>);

  const settingsGrouped = SETTINGS_GROUPS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, SettingsGroupDef[]>);

  // Get breadcrumb label
  const getBreadcrumb = () => {
    if (sidebarMode === "sections") {
      if (sectionDrilldown === "header") return "Header";
      if (sectionDrilldown === "footer") return "Rodapé";
      if (sectionDrilldown) return "Editar Seção";
      return null;
    }
    if (settingsDrilldown !== null && settingsDrilldown !== undefined) {
      // Check theme registry groups first
      const themeGroups = themeRegistry.getGlobalSettingsSchema();
      if (themeGroups.length > 0 && typeof settingsDrilldown === "number") {
        return themeGroups[settingsDrilldown]?.name || null;
      }
      return SETTINGS_GROUPS.find(s => s.id === settingsDrilldown)?.label || null;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-4 md:-m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/admin/themes" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Temas
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded hover:bg-[hsl(var(--admin-bg))]">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <span className="text-[11px] text-muted-foreground">
            {getBreadcrumb() || PAGE_OPTIONS.find(p => p.value === selectedPage)?.label}
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

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] flex flex-col transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-[300px]"
        }`}>
          {!sidebarCollapsed && (
            <>
              {/* Two mode tabs */}
              <div className="flex border-b border-[hsl(var(--admin-border))] shrink-0">
                <button
                  onClick={() => { setSidebarMode("sections"); setSettingsDrilldown(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-medium transition-colors relative ${
                    sidebarMode === "sections"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Seções
                  {sidebarMode === "sections" && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => { setSidebarMode("settings"); setSectionDrilldown(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-medium transition-colors relative ${
                    sidebarMode === "settings"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                  {sidebarMode === "settings" && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
                  )}
                </button>
              </div>

              {/* Sidebar content */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  {sidebarMode === "sections" ? (
                    <SectionsTab
                      selectedPage={selectedPage}
                      pageGroups={pageGroups}
                      onPageChange={handlePageChange}
                      drilldown={sectionDrilldown}
                      onDrilldown={setSectionDrilldown}
                      theme={theme}
                      onChange={updateTheme}
                      homepageSections={homepageSections || []}
                      iframeRef={iframeRef}
                    />
                  ) : (
                    <SettingsTab
                      drilldown={settingsDrilldown}
                      onDrilldown={setSettingsDrilldown}
                      settingsGrouped={settingsGrouped}
                      theme={theme}
                      onChange={updateTheme}
                      onApplyPreset={(preset) => {
                        const newTheme = { ...theme, ...preset };
                        setTheme(newTheme);
                        applyToIframe(newTheme);
                        toast.success("Preset aplicado! Clique 'Salvar tema' para persistir.");
                      }}
                    />
                  )}
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

// ═══════════════════════════════════════════════════════════
// ─── Sections Tab ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const SectionsTab = ({
  selectedPage, pageGroups, onPageChange, drilldown, onDrilldown,
  theme, onChange, homepageSections, iframeRef,
}: {
  selectedPage: EditorPage;
  pageGroups: Record<string, PageOption[]>;
  onPageChange: (page: EditorPage) => void;
  drilldown: string | null;
  onDrilldown: (id: string | null) => void;
  theme: Record<string, string>;
  onChange: (key: string, value: string) => void;
  homepageSections: any[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) => {
  // Drilldown: Header
  if (drilldown === "header") {
    return (
      <>
        <button onClick={() => onDrilldown(null)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        <HeaderSectionPanel theme={theme} onChange={onChange} />
      </>
    );
  }

  // Drilldown: Footer
  if (drilldown === "footer") {
    return (
      <>
        <button onClick={() => onDrilldown(null)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        <FooterSectionPanel theme={theme} onChange={onChange} />
      </>
    );
  }

  // Drilldown: editing a section
  if (drilldown && drilldown !== "header" && drilldown !== "footer") {
    if (selectedPage === "index") {
      return (
        <HomepageSectionEdit
          sectionId={drilldown}
          sections={homepageSections}
          iframeRef={iframeRef}
          onBack={() => onDrilldown(null)}
        />
      );
    }
    return (
      <PageSectionEdit
        sectionId={drilldown}
        pageType={PAGE_TYPE_MAP[selectedPage]}
        iframeRef={iframeRef}
        onBack={() => onDrilldown(null)}
      />
    );
  }

  // List view
  return (
    <>
      {/* Page selector */}
      <Select value={selectedPage} onValueChange={(v) => onPageChange(v as EditorPage)}>
        <SelectTrigger className="h-8 text-[12px] bg-[hsl(var(--admin-bg))]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(pageGroups).map(([group, pages]) => (
            <SelectGroup key={group}>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{group}</SelectLabel>
              {pages.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-[12px]">{p.label}</SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Header (special, always on top) */}
      <div
        onClick={() => onDrilldown("header")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--admin-border))] hover:border-foreground/30 cursor-pointer transition-colors bg-[hsl(var(--admin-bg))]"
      >
        <Menu className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[12px] font-medium">Header</p>
          <p className="text-[10px] text-muted-foreground">Barra de anúncio + Navegação</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Page sections */}
      {selectedPage === "index" ? (
        <HomepageSectionsList
          sections={homepageSections}
          iframeRef={iframeRef}
          onEditSection={(id) => onDrilldown(id)}
        />
      ) : (
        <PageSectionsList
          pageType={PAGE_TYPE_MAP[selectedPage]}
          availableTypes={PAGE_AVAILABLE_SECTIONS[selectedPage] || []}
          iframeRef={iframeRef}
          onEditSection={(id) => onDrilldown(id)}
        />
      )}

      {/* Footer (special, always on bottom) */}
      <div
        onClick={() => onDrilldown("footer")}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[hsl(var(--admin-border))] hover:border-foreground/30 cursor-pointer transition-colors bg-[hsl(var(--admin-bg))]"
      >
        <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[12px] font-medium">Rodapé</p>
          <p className="text-[10px] text-muted-foreground">Layout, conteúdo e redes sociais</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════
// ─── Settings Tab ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const SettingsTab = ({
  drilldown, onDrilldown, settingsGrouped, theme, onChange, onApplyPreset,
}: {
  drilldown: string | number | null;
  onDrilldown: (id: string | number | null) => void;
  settingsGrouped: Record<string, SettingsGroupDef[]>;
  theme: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onApplyPreset: (values: Record<string, string>) => void;
}) => {
  const themeGroups = themeRegistry.getGlobalSettingsSchema();
  const useRegistryGroups = themeGroups.length > 0;
  const { uploadImage, uploading } = useImageUpload();

  // Drilldown into a theme-registry group (number index)
  if (useRegistryGroups && typeof drilldown === "number") {
    const selectedGroup = themeGroups[drilldown];
    if (!selectedGroup) return null;
    return (
      <>
        <button onClick={() => onDrilldown(null)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        <p className="text-[13px] font-semibold mb-3">{selectedGroup.name}</p>
        <div className="space-y-3">
          {selectedGroup.settings.map(setting => (
            <SchemaField
              key={setting.id}
              setting={setting}
              value={theme[`theme_${setting.id}`] ?? setting.default}
              onChange={(val) => onChange(`theme_${setting.id}`, String(val))}
              onImageUpload={uploadImage}
              uploading={uploading}
            />
          ))}
        </div>
      </>
    );
  }

  // Drilldown into a hardcoded settings panel (string id — fallback)
  if (typeof drilldown === "string" && drilldown) {
    return (
      <>
        <button onClick={() => onDrilldown(null)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        {drilldown === "presets" && <PresetsSection theme={theme} onApply={onApplyPreset} />}
        {drilldown === "colors" && <ColorsSection theme={theme} onChange={onChange} />}
        {drilldown === "typography" && <TypographySection theme={theme} onChange={onChange} />}
        {drilldown === "layout" && <LayoutSection theme={theme} onChange={onChange} />}
        {drilldown === "buttons" && <ButtonsSection theme={theme} onChange={onChange} />}
        {drilldown === "effects" && <EffectsSection theme={theme} onChange={onChange} />}
        {drilldown === "product_card" && <ProductCardSection theme={theme} onChange={onChange} />}
        {drilldown === "product_page" && <ProductPageSection theme={theme} onChange={onChange} />}
        {drilldown === "category" && <CategorySection theme={theme} onChange={onChange} />}
        {drilldown === "cart" && <CartSection theme={theme} onChange={onChange} />}
        {drilldown === "checkout" && <CheckoutSection theme={theme} onChange={onChange} />}
        {drilldown === "social" && <SocialSection theme={theme} onChange={onChange} />}
        {drilldown === "seo" && <SeoSection theme={theme} onChange={onChange} />}
        {drilldown === "custom_css" && <CustomCssSection theme={theme} onChange={onChange} />}
      </>
    );
  }

  // List view — use theme registry groups if available, otherwise hardcoded
  if (useRegistryGroups) {
    return (
      <>
        {themeGroups.map((group, index) => (
          <button
            key={index}
            onClick={() => onDrilldown(index)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[hsl(var(--admin-bg))] transition-colors text-left"
          >
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-[12px] font-medium flex-1">{group.name}</span>
            <span className="text-[10px] text-muted-foreground">{group.settings.length}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}
      </>
    );
  }

  // Fallback: hardcoded groups
  return (
    <>
      {Object.entries(settingsGrouped).map(([group, items]) => (
        <div key={group} className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-1 pt-2">{group}</p>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onDrilldown(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[hsl(var(--admin-bg))] transition-colors text-left"
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-[12px] font-medium flex-1">{item.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      ))}
    </>
  );
};

// ═══════════════════════════════════════════════════════════
// ─── Header Section Panel (merged statusbar + navigation) ─
// ═══════════════════════════════════════════════════════════
const HeaderSectionPanel = ({ theme, onChange }: FieldProps) => (
  <>
    <SectionTitle>Barra de Anúncio</SectionTitle>
    <ToggleField label="Visível" themeKey="theme_statusbar_visible" theme={theme} onChange={onChange} />
    <ColorGroup label="Fundo" hKey="theme_statusbar_bg_h" sKey="theme_statusbar_bg_s" lKey="theme_statusbar_bg_l" theme={theme} onChange={onChange} />
    <ColorGroup label="Texto" hKey="theme_statusbar_fg_h" sKey="theme_statusbar_fg_s" lKey="theme_statusbar_fg_l" theme={theme} onChange={onChange} />
    <SliderField label="Altura" themeKey="theme_statusbar_height" theme={theme} onChange={onChange} min={28} max={48} unit="px" />
    <SliderField label="Tamanho da Fonte" themeKey="theme_statusbar_font_size" theme={theme} onChange={onChange} min={8} max={14} unit="px" />
    <TextInputField label="Mensagem 1" themeKey="theme_statusbar_text_1" theme={theme} onChange={onChange} placeholder="Frete grátis acima de R$250" />
    <TextInputField label="Mensagem 2" themeKey="theme_statusbar_text_2" theme={theme} onChange={onChange} placeholder="Garantia de 365 dias" />
    <TextInputField label="Mensagem 3" themeKey="theme_statusbar_text_3" theme={theme} onChange={onChange} placeholder="+100.000 clientes satisfeitos" />
    <SliderField label="Velocidade de Rotação" themeKey="theme_statusbar_rotation_speed" theme={theme} onChange={onChange} min={1000} max={10000} step={500} unit="ms" />

    <div className="border-t border-[hsl(var(--admin-border))] pt-4 mt-4" />

    <SectionTitle>Navegação</SectionTitle>
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

// ═══════════════════════════════════════════════════════════
// ─── Footer Section Panel ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
const FooterSectionPanel = ({ theme, onChange }: FieldProps) => (
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

// ═══════════════════════════════════════════════════════════
// ─── Homepage Sections List (list mode) ───────────────────
// ═══════════════════════════════════════════════════════════
const HomepageSectionsList = ({ sections, iframeRef, onEditSection }: {
  sections: any[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onEditSection: (id: string) => void;
}) => {
  const updateSection = useUpdateSection();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
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

  const refreshIframe = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "theme-content-refresh" }, "*");
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
      if (result) onEditSection(result.id);
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

  return (
    <>
      <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
        {localSections.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-muted-foreground">Nenhuma seção configurada.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {localSections.map(s => (
                <SortableSectionItem key={s.id} section={s} onEdit={() => onEditSection(s.id)} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full h-8 text-[11px] rounded-lg" onClick={() => setAddDialogOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adicionar Seção
      </Button>

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

// ═══════════════════════════════════════════════════════════
// ─── Homepage Section Edit (drilldown) ────────────────────
// ═══════════════════════════════════════════════════════════
interface BlockData { [key: string]: string; }

const HomepageSectionEdit = ({ sectionId, sections, iframeRef, onBack }: {
  sectionId: string;
  sections: any[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onBack: () => void;
}) => {
  const updateSection = useUpdateSection();
  const { upload } = useImageUpload();
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editBlocks, setEditBlocks] = useState<BlockData[]>([]);
  const [initialized, setInitialized] = useState(false);

  const section = sections.find(s => s.id === sectionId);

  useEffect(() => {
    if (section && !initialized) {
      const config = (section.config && typeof section.config === "object" && !Array.isArray(section.config)) ? section.config as Record<string, Json | undefined> : {};
      const blocks = Array.isArray(config.blocks) ? (config.blocks as BlockData[]) : [];
      setEditForm({
        title: section.title || "",
        subtitle: section.subtitle || "",
        description: section.description || "",
        cta_text: section.cta_text || "",
        link_url: section.link_url || "",
        image_url: section.image_url || "",
        image_url_2: section.image_url_2 || "",
        is_visible: section.is_visible,
        ...Object.fromEntries(
          Object.entries(config).filter(([k]) => k !== "blocks")
        ),
      });
      setEditBlocks(blocks);
      setInitialized(true);
    }
  }, [section, initialized]);

  if (!section) {
    return (
      <>
        <button onClick={onBack} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        <p className="text-[11px] text-muted-foreground">Seção não encontrada.</p>
      </>
    );
  }

  const schema = SECTION_SCHEMAS[section.section_type];
  const typeInfo = SECTION_TYPES.find(t => t.value === section.section_type);

  const refreshIframe = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "theme-content-refresh" }, "*");
  };

  const handleBlockImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const url = await upload(file);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const config: Record<string, any> = {};
      const originalConfig = (section.config && typeof section.config === "object") ? section.config as Record<string, any> : {};
      Object.assign(config, originalConfig);
      if (editBlocks.length > 0) config.blocks = editBlocks;
      else delete config.blocks;
      for (const [k, v] of Object.entries(editForm)) {
        if (!["title", "subtitle", "description", "cta_text", "link_url", "image_url", "image_url_2", "is_visible"].includes(k)) {
          config[k] = v;
        }
      }
      await updateSection.mutateAsync({
        id: section.id,
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
      onBack();
    } catch {
      toast.error("Erro ao salvar seção");
    }
  };

  return (
    <>
      <button onClick={onBack}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
        <ArrowLeft className="h-3 w-3" /> Voltar
      </button>
      <SectionTitle>{typeInfo?.label || section.section_type}</SectionTitle>
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

        <div className="flex items-center justify-between py-2">
          <Label className="text-[11px] text-muted-foreground">Visível</Label>
          <Switch checked={editForm.is_visible !== false} onCheckedChange={(v) => setEditForm(f => ({ ...f, is_visible: v }))} />
        </div>

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
};

// ═══════════════════════════════════════════════════════════
// ─── Page Sections List (non-homepage pages) ──────────────
// ═══════════════════════════════════════════════════════════
interface PageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  link_url?: string;
  image_url?: string;
  image_url_2?: string;
  is_visible: boolean;
  blocks?: BlockData[];
  [key: string]: any;
}

const PageSectionsList = ({ pageType, availableTypes, iframeRef, onEditSection }: {
  pageType: string;
  availableTypes: string[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onEditSection: (id: string) => void;
}) => {
  const { data: template, isLoading } = usePageTemplate(pageType);
  const saveTemplate = useSavePageTemplate();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Convert template data to ordered sections array
  const sections = useMemo((): PageSection[] => {
    if (!template) return [];
    const order = (template.section_order || []) as string[];
    const sectionsMap = (template.sections || {}) as Record<string, any>;
    return order
      .filter(id => sectionsMap[id])
      .map(id => ({
        id,
        ...sectionsMap[id],
        is_visible: sectionsMap[id].is_visible !== false,
      }));
  }, [template]);

  const refreshIframe = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "theme-content-refresh" }, "*");
  };

  const saveUpdatedTemplate = async (newSections: Record<string, any>, newOrder: string[]) => {
    await saveTemplate.mutateAsync({
      id: template?.id,
      page_type: pageType,
      name: pageType,
      sections: newSections,
      section_order: newOrder,
      is_default: true,
    });
    refreshIframe();
  };

  const handleToggle = async (s: PageSection) => {
    if (!template) return;
    const sectionsMap = { ...(template.sections as Record<string, any>) };
    sectionsMap[s.id] = { ...sectionsMap[s.id], is_visible: !s.is_visible };
    await saveUpdatedTemplate(sectionsMap, template.section_order as string[]);
  };

  const handleDelete = async (id: string) => {
    if (!template) return;
    const sectionsMap = { ...(template.sections as Record<string, any>) };
    delete sectionsMap[id];
    const newOrder = ((template.section_order || []) as string[]).filter(i => i !== id);
    await saveUpdatedTemplate(sectionsMap, newOrder);
    toast.success("Seção excluída");
  };

  const handleAddSection = async (typeValue: string) => {
    const id = crypto.randomUUID();
    const existingSections = template ? { ...(template.sections as Record<string, any>) } : {};
    const existingOrder = template ? [...(template.section_order as string[])] : [];
    existingSections[id] = { type: typeValue, is_visible: true };
    existingOrder.push(id);
    await saveTemplate.mutateAsync({
      id: template?.id,
      page_type: pageType,
      name: pageType,
      sections: existingSections,
      section_order: existingOrder,
      is_default: true,
    });
    setAddDialogOpen(false);
    refreshIframe();
    onEditSection(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !template) return;
    const order = [...(template.section_order as string[])];
    const oldIndex = order.indexOf(active.id as string);
    const newIndex = order.indexOf(over.id as string);
    const newOrder = arrayMove(order, oldIndex, newIndex);
    await saveUpdatedTemplate(template.sections as Record<string, any>, newOrder);
  };

  const filteredTypes = SECTION_TYPES
    .filter(t => availableTypes.includes(t.value))
    .filter(t =>
      t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
        {sections.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-muted-foreground">Nenhuma seção configurada.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map(s => (
                <SortableSectionItem key={s.id}
                  section={{ ...s, section_type: s.type }}
                  onEdit={() => onEditSection(s.id)}
                  onToggle={() => handleToggle(s)}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full h-8 text-[11px] rounded-lg" onClick={() => setAddDialogOpen(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adicionar Seção
      </Button>

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

// ═══════════════════════════════════════════════════════════
// ─── Page Section Edit (non-homepage) ─────────────────────
// ═══════════════════════════════════════════════════════════
const PageSectionEdit = ({ sectionId, pageType, iframeRef, onBack }: {
  sectionId: string;
  pageType: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onBack: () => void;
}) => {
  const { data: template } = usePageTemplate(pageType);
  const saveTemplate = useSavePageTemplate();
  const { upload } = useImageUpload();
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editBlocks, setEditBlocks] = useState<BlockData[]>([]);
  const [initialized, setInitialized] = useState(false);

  const sectionData = useMemo(() => {
    if (!template) return null;
    const sectionsMap = (template.sections || {}) as Record<string, any>;
    return sectionsMap[sectionId] || null;
  }, [template, sectionId]);

  useEffect(() => {
    if (sectionData && !initialized) {
      const blocks = Array.isArray(sectionData.blocks) ? sectionData.blocks : [];
      const { type, blocks: _b, ...rest } = sectionData;
      setEditForm({ is_visible: sectionData.is_visible !== false, ...rest });
      // For product_info, ensure all block types are present from the start
      if (sectionData.type === "product_info" && blocks.length === 0) {
        setEditBlocks(DEFAULT_PRODUCT_INFO_BLOCKS as unknown as BlockData[]);
      } else {
        setEditBlocks(blocks);
      }
      setInitialized(true);
    }
  }, [sectionData, initialized]);

  if (!sectionData) {
    return (
      <>
        <button onClick={onBack} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
        <p className="text-[11px] text-muted-foreground">Seção não encontrada.</p>
      </>
    );
  }

  const schema = SECTION_SCHEMAS[sectionData.type];
  const typeInfo = SECTION_TYPES.find(t => t.value === sectionData.type);

  const refreshIframe = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "theme-content-refresh" }, "*");
  };

  const handleBlockImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try { return await upload(file); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      const sectionsMap = { ...(template.sections as Record<string, any>) };
      const updatedSection: Record<string, any> = {
        type: sectionData.type,
        ...editForm,
      };
      if (editBlocks.length > 0) updatedSection.blocks = editBlocks;
      sectionsMap[sectionId] = updatedSection;
      await saveTemplate.mutateAsync({
        id: template.id,
        page_type: pageType,
        name: pageType,
        sections: sectionsMap,
        section_order: template.section_order as string[],
        is_default: true,
      });
      refreshIframe();
      toast.success("Seção salva!");
      onBack();
    } catch {
      toast.error("Erro ao salvar seção");
    }
  };

  return (
    <>
      <button onClick={onBack}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
        <ArrowLeft className="h-3 w-3" /> Voltar
      </button>
      <SectionTitle>{typeInfo?.label || sectionData.type}</SectionTitle>
      <div className="space-y-3 mt-3">
        {/* Product Info: special named blocks editor */}
        {sectionData.type === "product_info" ? (
          <ProductInfoBlocksEditor
            blocks={editBlocks.length > 0 ? editBlocks as unknown as ProductInfoBlock[] : DEFAULT_PRODUCT_INFO_BLOCKS}
            onBlocksChange={(blocks) => setEditBlocks(blocks as unknown as BlockData[])}
          />
        ) : (
          <>
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
          </>
        )}

        <div className="flex items-center justify-between py-2">
          <Label className="text-[11px] text-muted-foreground">Visível</Label>
          <Switch checked={editForm.is_visible !== false} onCheckedChange={(v) => setEditForm(f => ({ ...f, is_visible: v }))} />
        </div>

        {schema?.blocks && sectionData.type !== "product_info" && (
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
          disabled={saveTemplate.isPending}>
          <Save className="h-3 w-3 mr-1" />
          {saveTemplate.isPending ? "Salvando..." : "Salvar Seção"}
        </Button>
      </div>
    </>
  );
};


const SortableSectionItem = ({ section, onEdit, onToggle, onDelete }: {
  section: any; onEdit: () => void; onToggle: (s: any) => void; onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const typeInfo = SECTION_TYPES.find(t => t.value === section.section_type);

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2 px-2 py-2 hover:bg-[hsl(var(--admin-bg))] transition-colors group">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
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

// ═══════════════════════════════════════════════════════════
// ─── Block Editor ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// ─── Product Info Blocks Editor (named blocks, reorderable)
// ═══════════════════════════════════════════════════════════
const ProductInfoBlocksEditor = ({ blocks, onBlocksChange }: {
  blocks: ProductInfoBlock[];
  onBlocksChange: (blocks: ProductInfoBlock[]) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fullBlocks = useMemo(() => {
    const existing = new Set(blocks.map(b => b.type));
    const result = [...blocks];
    for (const bt of PRODUCT_INFO_BLOCK_TYPES) {
      if (!existing.has(bt.type)) {
        result.push({ type: bt.type, visible: false });
      }
    }
    return result;
  }, [blocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fullBlocks.findIndex(b => b.type === active.id);
    const newIndex = fullBlocks.findIndex(b => b.type === over.id);
    onBlocksChange(arrayMove(fullBlocks, oldIndex, newIndex));
  };

  const handleToggle = (type: string) => {
    onBlocksChange(fullBlocks.map(b => b.type === type ? { ...b, visible: !b.visible } : b));
  };

  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground font-medium">Blocos do Produto</Label>
      <p className="text-[10px] text-muted-foreground mb-2">Arraste para reordenar. Alterne a visibilidade de cada bloco.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fullBlocks.map(b => b.type)} strategy={verticalListSortingStrategy}>
          {fullBlocks.map(block => {
            const bt = PRODUCT_INFO_BLOCK_TYPES.find(t => t.type === block.type);
            if (!bt) return null;
            return (
              <SortableProductInfoBlock
                key={block.type}
                block={block}
                label={bt.label}
                icon={bt.icon}
                onToggle={() => handleToggle(block.type)}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableProductInfoBlock = ({ block, label, icon: Icon, onToggle }: {
  block: ProductInfoBlock;
  label: string;
  icon: typeof Type;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.type });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border border-[hsl(var(--admin-border))] mb-1 transition-colors ${
        block.visible ? "bg-[hsl(var(--admin-bg))]" : "bg-[hsl(var(--admin-surface))] opacity-60"
      }`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none shrink-0">
        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
      </button>
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-[11px] font-medium flex-1">{label}</span>
      <button onClick={onToggle} className="p-0.5 rounded hover:bg-[hsl(var(--admin-surface))]">
        {block.visible
          ? <Eye className="h-3 w-3 text-[hsl(var(--admin-success))]" />
          : <EyeOff className="h-3 w-3 text-muted-foreground" />}
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
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
            <input type="color" value={hexValue} onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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

// ═══════════════════════════════════════════════════════════
// ─── Section Panels (Settings tab drilldowns) ─────────────
// ═══════════════════════════════════════════════════════════

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
    <SelectField label="Fonte de Display (Títulos)" themeKey="theme_font_display" theme={theme} onChange={onChange} options={FONT_OPTIONS} />
    <SelectField label="Fonte do Corpo (Texto)" themeKey="theme_font_body" theme={theme} onChange={onChange} options={FONT_OPTIONS} />
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
const PresetsSection = ({ theme, onApply }: { theme: Record<string, string>; onApply: (values: Record<string, string>) => void }) => (
  <>
    <SectionTitle>Presets de Tema</SectionTitle>
    <p className="text-[11px] text-muted-foreground">Escolha um tema base para começar. Você pode personalizar tudo depois.</p>
    <div className="space-y-3">
      {THEME_PRESETS.map((preset) => {
        const bgColor = hslToHex(
          parseInt(preset.values.theme_bg_h || DEFAULTS.theme_bg_h),
          parseInt(preset.values.theme_bg_s || DEFAULTS.theme_bg_s),
          parseInt(preset.values.theme_bg_l || DEFAULTS.theme_bg_l),
        );
        const fgColor = hslToHex(
          parseInt(preset.values.theme_fg_h || DEFAULTS.theme_fg_h),
          parseInt(preset.values.theme_fg_s || DEFAULTS.theme_fg_s),
          parseInt(preset.values.theme_fg_l || DEFAULTS.theme_fg_l),
        );
        const primaryColor = hslToHex(
          parseInt(preset.values.theme_primary_h || DEFAULTS.theme_primary_h),
          parseInt(preset.values.theme_primary_s || DEFAULTS.theme_primary_s),
          parseInt(preset.values.theme_primary_l || DEFAULTS.theme_primary_l),
        );
        return (
          <button key={preset.name} onClick={() => onApply(preset.values)}
            className="w-full p-3 rounded-lg border border-[hsl(var(--admin-border))] hover:border-foreground/30 transition-colors text-left">
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

export default AdminThemeEditor;
