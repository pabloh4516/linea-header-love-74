import { useMemo } from "react";
import { useSiteSettings } from "./useSiteSettings";

const bool = (val: string | undefined, fallback: boolean): boolean => {
  if (val === undefined || val === null || val === "") return fallback;
  return val !== "false";
};

const str = (val: string | undefined, fallback: string): string => val || fallback;

export const useThemeConfig = () => {
  const { data: settings, isLoading } = useSiteSettings();

  const theme = useMemo(() => {
    const s = settings || {};
    return {
      // ── CARDS ──────────────────────────────────────────
      cardAspect: str(s.theme_card_aspect, "3/4"),
      cardHoverEffect: str(s.theme_card_hover_effect, "zoom"),
      cardShowCategory: bool(s.theme_card_show_category, true),
      cardShowBadge: bool(s.theme_card_show_badge, true),
      cardBadgeStyle: str(s.theme_card_badge_style, "filled"),
      cardPriceWeight: str(s.theme_card_price_weight, "300"),
      cardNameSize: str(s.theme_card_name_size, "14"),
      cardGap: str(s.theme_card_gap, "16"),
      cardColumnsDesktop: str(s.theme_card_columns_desktop, "3"),
      cardColumnsMobile: str(s.theme_card_columns_mobile, "2"),
      // New ecommerce-br card keys
      cardBorderRadius: str(s.theme_product_border_radius, str(s.theme_card_border_radius, "12")),
      cardBorderEnabled: bool(s.theme_product_border_enabled, true),
      cardBorderColor: str(s.theme_product_border_color, "#F5F5F5"),
      cardBorderHoverColor: str(s.theme_product_border_hover_color, ""),
      cardShadowEnabled: bool(s.theme_product_shadow_enabled, true),
      cardShowRating: bool(s.theme_product_show_rating, true),
      cardShowAddtocart: bool(s.theme_product_show_addtocart, false),
      cardLabelStyle: str(s.theme_product_label_style, "rounded"),
      cardShowSaleLabel: bool(s.theme_product_show_sale_label, true),
      cardSaleLabelStyle: str(s.theme_product_sale_label_style, "percentage"),
      cardShowNewLabel: bool(s.theme_product_show_new_label, true),
      cardImgCount: str(s.theme_product_img_count, "2"),

      // ── PDP ────────────────────────────────────────────
      pdpLayout: str(s.theme_pdp_layout, "side-by-side"),
      pdpShowBreadcrumb: bool(s.theme_pdp_show_breadcrumb, true),
      pdpShowEditorNotes: bool(s.theme_pdp_show_editor_notes, true),
      pdpShowDetailsGrid: bool(s.theme_pdp_show_details_grid, true),
      pdpShowTrustBadges: bool(s.theme_pdp_show_trust_badges, true),
      pdpStickyInfo: bool(s.theme_pdp_sticky_info, true),
      pdpShowRelated: bool(s.theme_pdp_show_related, true),
      pdpShowSku: s.theme_pdp_show_sku === "true",
      // New ecommerce-br PDP keys
      pdpImageClick: str(s.theme_pdp_image_click, "zoom"),
      pdpStickyAddtocart: bool(s.theme_pdp_sticky_addtocart, true),
      pdpShowShare: bool(s.theme_pdp_show_share, true),
      pdpShowVendor: bool(s.theme_pdp_show_vendor, false),
      pdpShowStock: bool(s.theme_pdp_show_stock, false),
      pdpShowQuantity: bool(s.theme_pdp_show_quantity, true),
      pdpShowBuyNow: bool(s.theme_pdp_show_buy_now, true),
      pdpShowPaymentIcons: bool(s.theme_pdp_show_payment_icons, true),
      pdpVariantStyle: str(s.theme_pdp_variant_style, "buttons"),

      // ── CATEGORY ───────────────────────────────────────
      categoryLayout: str(s.theme_category_layout, "standard"),
      categoryShowHeader: bool(s.theme_category_show_header, true),
      categoryShowFilters: bool(s.theme_category_show_filters, true),
      categoryShowSort: bool(s.theme_category_show_sort, true),
      categoryShowCount: bool(s.theme_category_show_count, true),
      categoryProductsPerPage: parseInt(str(s.theme_category_products_per_page, "12")),
      // New ecommerce-br collection keys
      collectionSidebar: str(s.theme_collection_sidebar, "none"),
      collectionColumnsDesktop: str(s.theme_collection_columns_desktop, str(s.theme_card_columns_desktop, "4")),
      collectionColumnsMobile: str(s.theme_collection_columns_mobile, str(s.theme_card_columns_mobile, "2")),
      collectionInfiniteScroll: bool(s.theme_collection_infinite_scroll, false),

      // ── CART ────────────────────────────────────────────
      cartStyle: str(s.theme_cart_style, "drawer"),
      cartWidth: str(s.theme_cart_width, "384"),
      cartShowThumbnails: bool(s.theme_cart_show_thumbnails, true),
      cartShowQuantity: bool(s.theme_cart_show_quantity, true),
      cartShowContinue: bool(s.theme_cart_show_continue, true),
      cartShowSubtotal: bool(s.theme_cart_show_subtotal, true),
      cartCtaText: str(s.theme_cart_cta_text, "Finalizar Compra"),
      // New ecommerce-br cart keys
      cartType: str(s.theme_cart_type, str(s.theme_cart_style, "drawer")),
      cartAfterAdd: str(s.theme_cart_after_add, "drawer"),
      cartDrawerWidth: str(s.theme_cart_drawer_width, str(s.theme_cart_width, "400")),
      cartShowShippingBar: bool(s.theme_cart_show_shipping_bar, true),
      cartFreeShippingValue: str(s.theme_cart_free_shipping_value, "199"),
      cartShowUpsell: bool(s.theme_cart_show_upsell, true),

      // ── BUTTONS ────────────────────────────────────────
      buttonStyle: str(s.theme_button_style, "solid"),
      buttonRadius: str(s.theme_button_radius, "0"),
      buttonHeight: str(s.theme_button_height, "52"),
      buttonFontSize: str(s.theme_button_font_size, "12"),
      buttonLetterSpacing: str(s.theme_button_letter_spacing, "0.15"),
      buttonFontWeight: str(s.theme_button_font_weight, "300"),

      // ── FOOTER ─────────────────────────────────────────
      footerLayout: str(s.theme_footer_layout, "two-column"),
      footerShowSocial: bool(s.theme_footer_show_social, true),
      footerShowNewsletter: bool(s.theme_footer_show_newsletter, false),
      footerShowPaymentIcons: bool(s.theme_footer_show_payment_icons, false),
      // New ecommerce-br footer keys
      footerDesign: str(s.theme_footer_design, str(s.theme_footer_layout, "1")),
      footerShowPayment: bool(s.theme_footer_show_payment, bool(s.theme_footer_show_payment_icons, true)),

      // ── PARCELAMENTO (BR) ──────────────────────────────
      parcelaEnabled: bool(s.theme_parcela_enabled, true),
      parcelaProductPage: bool(s.theme_parcela_product_page, true),
      parcelaSemJuros: bool(s.theme_parcela_sem_juros, true),
      parcelaMax: str(s.theme_parcela_max, "12"),
      parcelaColorPrice: str(s.theme_parcela_color_price, "#1BB794"),

      // ── PIX (BR) ───────────────────────────────────────
      pixEnabled: bool(s.theme_pix_enabled, true),
      pixDiscount: str(s.theme_pix_discount, "5"),
      pixColor: str(s.theme_pix_color, "#4381fc"),
      pixCartEnabled: bool(s.theme_pix_cart_enabled, true),

      // ── WHATSAPP (BR) ──────────────────────────────────
      whatsappEnabled: bool(s.theme_whatsapp_float_enabled, false),
      whatsappNumber: str(s.theme_whatsapp_number, ""),
      whatsappPosition: str(s.theme_whatsapp_position, "right"),
      whatsappColor: str(s.theme_whatsapp_color, "#25D366"),
      whatsappPopup: bool(s.theme_whatsapp_popup, true),

      // ── ANNOUNCEMENT ───────────────────────────────────
      announcementEnabled: bool(s.theme_announcement_enabled, bool(s.theme_statusbar_visible, true)),
      announcementText1: str(s.theme_announcement_text_1, str(s.theme_statusbar_text_1, "Frete grátis")),
      announcementText2: str(s.theme_announcement_text_2, str(s.theme_statusbar_text_2, "")),
      announcementText3: str(s.theme_announcement_text_3, str(s.theme_statusbar_text_3, "")),
      announcementClosable: bool(s.theme_announcement_closable, false),
    };
  }, [settings]);

  return { theme, isLoading };
};
