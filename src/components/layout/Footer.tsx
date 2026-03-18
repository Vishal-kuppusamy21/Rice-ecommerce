import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-glow transition-transform hover:rotate-3 duration-500">
                <img src="/logo.png" alt="SK Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold tracking-tight">{t('header.title')}</h3>
                <p className="text-xs text-primary-foreground/60 font-semibold uppercase tracking-widest leading-none mt-1">{t('footer.subtitle')}</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-snug max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61585110312373" },
                { icon: Instagram, href: "https://www.instagram.com/shree.kumaravel?igsh=YTM3d2MxNXd1OXdm" },
                { icon: Youtube, href: "https://www.youtube.com/channel/UCzB7YW-7C6NN28KB2Md7O9Q" },
                { icon: Twitter, href: "https://x.com/ShreeKumaravel" },
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300">
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-bold mb-3 relative inline-block">
              {t('footer.quick_links')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white/20 rounded-full" />
            </h4>
            <ul className="space-y-1.5">
              {[
                { label: t('header.nav.all_products'), href: "/products" },
                { label: "Wholesale Enquiry", href: "/wholesale" },
                { label: t('header.nav.about'), href: "/about" },
                { label: t('footer.contacts'), href: "/contact" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-white transition-all hover:translate-x-1 inline-block link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif text-base font-bold mb-3 relative inline-block">
              {t('footer.customer_service')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white/20 rounded-full" />
            </h4>
            <ul className="space-y-1.5">
              {[
                { label: t('footer.links.track_order'), href: "/account/orders" },
                { label: t('footer.links.shipping_policy'), href: "/shipping" },
                { label: t('footer.links.returns_refunds'), href: "/returns" },
                { label: t('footer.links.return_policy'), href: "/return-policy" },
                { label: t('footer.links.faqs'), href: "/faq" },
                { label: t('footer.links.privacy_policy'), href: "/privacy" },
                { label: t('footer.links.terms_conditions'), href: "/terms" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-white transition-all hover:translate-x-1 inline-block link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-bold mb-3 relative inline-block">
              {t('footer.contacts')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white/20 rounded-full" />
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-sm text-primary-foreground/80 leading-snug">
                  {t('footer.address_line1')}<br />
                  {t('footer.address_line2')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-sm text-primary-foreground/80 font-bold">{t('header.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-sm text-primary-foreground/80 break-all">info.shreekumaravel@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/10">
        <div className="container-custom py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
            <p className="font-medium tracking-wide">{t('footer.copyright')}</p>
            <div className="flex items-center gap-6">
              <span className="opacity-70 font-bold uppercase tracking-widest text-[10px]">{t('footer.secure_payments')}</span>
              <div className="flex items-center gap-3">
                {['RazorPay', 'COD', 'UPI'].map((method, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
