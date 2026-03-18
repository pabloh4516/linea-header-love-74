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
      // CARDS
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

      // PDP
      pdpLayout: str(s.theme_pdp_layout, "side-by-side"),
      pdpShowBreadcrumb: bool(s.theme_pdp_show_breadcrumb, true),
      pdpShowEditorNotes: bool(s.theme_pdp_show_editor_notes, true),
      pdpShowDetailsGrid: bool(s.theme_pdp_show_details_grid, true),
      pdpShowTrustBadges: bool(s.theme_pdp_show_trust_badges, true),
      pdpStickyInfo: bool(s.theme_pdp_sticky_info, true),
      pdpShowRelated: bool(s.theme_pdp_show_related, true),
      pdpShowSku: s.theme_pdp_show_sku === "true",

      // CATEGORY
      categoryLayout: str(s.theme_category_layout, "standard"),
      categoryShowHeader: bool(s.theme_category_show_header, true),
      categoryShowFilters: bool(s.theme_category_show_filters, true),
      categoryShowSort: bool(s.theme_category_show_sort, true),
      categoryShowCount: bool(s.theme_category_show_count, true),
      categoryProductsPerPage: parseInt(str(s.theme_category_products_per_page, "12")),

      // CART
      cartStyle: str(s.theme_cart_style, "drawer"),
      cartWidth: str(s.theme_cart_width, "384"),
      cartShowThumbnails: bool(s.theme_cart_show_thumbnails, true),
      cartShowQuantity: bool(s.theme_cart_show_quantity, true),
      cartShowContinue: bool(s.theme_cart_show_continue, true),
      cartShowSubtotal: bool(s.theme_cart_show_subtotal, true),
      cartCtaText: str(s.theme_cart_cta_text, "Finalizar Compra"),

      // BUTTONS
      buttonStyle: str(s.theme_button_style, "solid"),
      buttonRadius: str(s.theme_button_radius, "0"),
      buttonHeight: str(s.theme_button_height, "52"),
      buttonFontSize: str(s.theme_button_font_size, "12"),
      buttonLetterSpacing: str(s.theme_button_letter_spacing, "0.15"),
      buttonFontWeight: str(s.theme_button_font_weight, "300"),

      // FOOTER
      footerLayout: str(s.theme_footer_layout, "two-column"),
      footerShowSocial: bool(s.theme_footer_show_social, true),
      footerShowNewsletter: bool(s.theme_footer_show_newsletter, false),
      footerShowPaymentIcons: bool(s.theme_footer_show_payment_icons, false),
    };
  }, [settings]);

  return { theme, isLoading };
};
