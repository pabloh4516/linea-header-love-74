import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemeConfig } from "@/hooks/useThemeConfig";

/* ── shared helpers ─────────────────────────────────────────── */

interface FooterData {
  tagline: string;
  address1: string;
  address2: string;
  phone: string;
  email: string;
  copyright: string;
  showSocial: boolean;
  showNewsletter: boolean;
  showPayment: boolean;
  socialLinks: { name: string; url: string }[];
}

const PaymentBadges = () => (
  <div className="flex flex-wrap gap-2 mt-4">
    {["Visa", "Mastercard", "Pix", "Boleto"].map((p) => (
      <span key={p} className="border border-background/20 text-background/50 text-[10px] tracking-wider px-3 py-1 rounded-sm">
        {p}
      </span>
    ))}
  </div>
);

const Logo = () => (
  <img src="/Linea_Jewelry_Inc-2.svg" alt="Linea Jewelry Inc." className="mb-6 h-6 w-auto invert" />
);

const ShopLinks = () => (
  <div>
    <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Loja</h4>
    <ul className="space-y-3">
      {["Novidades", "Anéis", "Brincos", "Pulseiras", "Colares"].map((l) => (
        <li key={l}><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{l}</a></li>
      ))}
    </ul>
  </div>
);

const SupportLinks = () => (
  <div>
    <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Suporte</h4>
    <ul className="space-y-3">
      {["Guia de Tamanhos", "Cuidados", "Trocas e Devoluções", "Envio", "Contato"].map((l) => (
        <li key={l}><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{l}</a></li>
      ))}
    </ul>
  </div>
);

const SocialLinks = ({ data }: { data: FooterData }) => (
  <div>
    <h4 className="text-editorial text-[10px] tracking-[0.15em] text-background/80 mb-5">Conecte-se</h4>
    <ul className="space-y-3">
      {data.showSocial && data.socialLinks.length > 0 ? (
        data.socialLinks.map((link) => (
          <li key={link.name}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{link.name}</a>
          </li>
        ))
      ) : (
        <>
          <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Instagram</a></li>
          <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Pinterest</a></li>
        </>
      )}
      {data.showNewsletter && (
        <li><a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Newsletter</a></li>
      )}
    </ul>
  </div>
);

const ContactBlock = ({ data }: { data: FooterData }) => (
  <div className="space-y-2 text-sm font-light text-background/60">
    <div>
      <p className="font-normal text-background/80 mb-1">Visite-nos</p>
      <p>{data.address1}</p>
      <p>{data.address2}</p>
    </div>
    <div>
      <p className="font-normal text-background/80 mb-1 mt-4">Contato</p>
      <p>{data.phone}</p>
      <p>{data.email}</p>
    </div>
  </div>
);

/* ── 1. Two-Column (default) ────────────────────────────────── */

const TwoColumnLayout = ({ data }: { data: FooterData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
    <div>
      <Logo />
      <p className="text-sm font-light text-background/60 leading-relaxed max-w-md mb-8">{data.tagline}</p>
      <ContactBlock data={data} />
      {data.showPayment && <PaymentBadges />}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <ShopLinks />
      <SupportLinks />
      <SocialLinks data={data} />
    </div>
  </div>
);

/* ── 2. Three-Column ────────────────────────────────────────── */

const ThreeColumnLayout = ({ data }: { data: FooterData }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
    <div>
      <Logo />
      <p className="text-sm font-light text-background/60 leading-relaxed mb-6">{data.tagline}</p>
      <ContactBlock data={data} />
      {data.showPayment && <PaymentBadges />}
    </div>
    <div className="space-y-10">
      <ShopLinks />
      <SupportLinks />
    </div>
    <SocialLinks data={data} />
  </div>
);

/* ── 3. Centered ────────────────────────────────────────────── */

const CenteredLayout = ({ data }: { data: FooterData }) => {
  const allLinks = ["Novidades", "Anéis", "Brincos", "Pulseiras", "Colares", "Guia de Tamanhos", "Cuidados", "Envio", "Contato"];
  const socials = data.showSocial && data.socialLinks.length > 0
    ? data.socialLinks
    : [{ name: "Instagram", url: "#" }, { name: "Pinterest", url: "#" }];

  return (
    <div className="flex flex-col items-center text-center mb-12 space-y-8">
      <Logo />
      <p className="text-sm font-light text-background/60 leading-relaxed max-w-lg">{data.tagline}</p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {allLinks.map((l) => (
          <a key={l} href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{l}</a>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {socials.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{link.name}</a>
        ))}
        {data.showNewsletter && (
          <a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Newsletter</a>
        )}
      </div>
      {data.showPayment && <PaymentBadges />}
    </div>
  );
};

/* ── 4. Minimal ─────────────────────────────────────────────── */

const MinimalLayout = ({ data }: { data: FooterData }) => {
  const socials = data.showSocial && data.socialLinks.length > 0
    ? data.socialLinks
    : [{ name: "Instagram", url: "#" }, { name: "Pinterest", url: "#" }];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="flex items-center gap-6">
        <img src="/Linea_Jewelry_Inc-2.svg" alt="Linea Jewelry Inc." className="h-5 w-auto invert" />
        <p className="text-sm font-light text-background/50 max-w-xs">{data.tagline}</p>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
        {socials.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">{link.name}</a>
        ))}
        {data.showNewsletter && (
          <a href="#" className="text-sm font-light text-background/50 hover:text-background transition-colors duration-300">Newsletter</a>
        )}
        {data.showPayment && <PaymentBadges />}
      </div>
    </div>
  );
};

/* ── layout map ─────────────────────────────────────────────── */

const layouts: Record<string, React.FC<{ data: FooterData }>> = {
  "two-column": TwoColumnLayout,
  "three-column": ThreeColumnLayout,
  "centered": CenteredLayout,
  "minimal": MinimalLayout,
};

/* ── main component ─────────────────────────────────────────── */

const Footer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { data: settings } = useSiteSettings();
  const { theme } = useThemeConfig();

  const data = useMemo<FooterData>(() => {
    const s = settings || {};
    const socialLinks: { name: string; url: string }[] = [];
    if (s.theme_social_instagram) socialLinks.push({ name: "Instagram", url: s.theme_social_instagram });
    if (s.theme_social_pinterest) socialLinks.push({ name: "Pinterest", url: s.theme_social_pinterest });
    if (s.theme_social_facebook) socialLinks.push({ name: "Facebook", url: s.theme_social_facebook });
    if (s.theme_social_tiktok) socialLinks.push({ name: "TikTok", url: s.theme_social_tiktok });
    if (s.theme_social_twitter) socialLinks.push({ name: "Twitter", url: s.theme_social_twitter });
    if (s.theme_social_youtube) socialLinks.push({ name: "YouTube", url: s.theme_social_youtube });

    return {
      tagline: s.theme_footer_tagline || "Joias minimalistas feitas para o indivíduo moderno",
      address1: s.theme_footer_address_line1 || "Rua Oscar Freire, 123",
      address2: s.theme_footer_address_line2 || "São Paulo, SP 01426-001",
      phone: s.theme_footer_phone || "+55 (11) 3456-7890",
      email: s.theme_footer_email || "contato@lineajewelry.com.br",
      copyright: s.theme_footer_copyright || "© 2024 Linea. Todos os direitos reservados.",
      showSocial: theme.footerShowSocial,
      showNewsletter: theme.footerShowNewsletter,
      showPayment: theme.footerShowPaymentIcons,
      socialLinks,
    };
  }, [settings, theme]);

  const LayoutComponent = layouts[theme.footerLayout] || TwoColumnLayout;

  return (
    <footer data-theme-section="footer" className="w-full bg-foreground text-background pt-16 pb-4 px-6 md:px-12 mt-0">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <LayoutComponent data={data} />
      </motion.div>

      <div className="border-t border-background/10 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs font-light text-background/40 mb-2 md:mb-0">
            {data.copyright} Template por{" "}
            <a href="https://www.liljeros.co" target="_blank" rel="noopener noreferrer" className="hover:text-background/70 transition-colors underline">
              Rickard Liljeros
            </a>
          </p>
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-xs font-light text-background/40 hover:text-background/70 transition-colors">Política de Privacidade</a>
            <a href="/terms-of-service" className="text-xs font-light text-background/40 hover:text-background/70 transition-colors">Termos de Serviço</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
