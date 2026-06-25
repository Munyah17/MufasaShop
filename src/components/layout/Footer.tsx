import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-obsidian-950 border-t border-gold-500/20 mt-24">
      {/* Gold divider accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold-500 rounded-sm flex items-center justify-center">
                <span className="text-obsidian-900 font-display font-black text-sm">M</span>
              </div>
              <span className="font-display font-bold text-gold-500 tracking-widest uppercase">
                Mufasa
              </span>
            </div>
            <p className="text-obsidian-400 text-sm leading-relaxed">
              Premium tech accessories and gadgets for the discerning professional. Where
              technology meets luxury.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Facebook, href: "#", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-obsidian-700 flex items-center justify-center text-obsidian-400 hover:border-gold-500 hover:text-gold-500 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-gold-500 text-xs tracking-[0.2em] uppercase font-semibold mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              {[
                ["All Products", "/products"],
                ["Smartphones", "/products?category=smartphones"],
                ["Audio", "/products?category=audio"],
                ["Wearables", "/products?category=wearables"],
                ["Accessories", "/products?category=accessories"],
                ["Featured", "/products?featured=true"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-obsidian-400 hover:text-gold-500 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-gold-500 text-xs tracking-[0.2em] uppercase font-semibold mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                ["Track Order", "/orders"],
                ["Returns & Refunds", "/support/returns"],
                ["Shipping Policy", "/support/shipping"],
                ["FAQ", "/support/faq"],
                ["Contact Us", "/support/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-obsidian-400 hover:text-gold-500 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-gold-500 text-xs tracking-[0.2em] uppercase font-semibold mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-gold-500 mt-0.5 shrink-0" />
                <span className="text-obsidian-400 text-sm">Harare, Zimbabwe</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-gold-500 shrink-0" />
                <a
                  href="tel:+263771234567"
                  className="text-obsidian-400 hover:text-gold-500 text-sm transition-colors"
                >
                  +263 77 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-gold-500 shrink-0" />
                <a
                  href="mailto:info@mufasagadgets.co.zw"
                  className="text-obsidian-400 hover:text-gold-500 text-sm transition-colors"
                >
                  info@mufasagadgets.co.zw
                </a>
              </li>
            </ul>

            {/* Payment methods accepted */}
            <div className="mt-6">
              <p className="text-obsidian-500 text-xs uppercase tracking-widest mb-2">
                We Accept
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-obsidian-800 border border-obsidian-700 rounded text-[10px] text-obsidian-300">
                  Stripe
                </span>
                <span className="px-2 py-1 bg-obsidian-800 border border-obsidian-700 rounded text-[10px] text-obsidian-300">
                  Paynow
                </span>
                <span className="px-2 py-1 bg-obsidian-800 border border-obsidian-700 rounded text-[10px] text-obsidian-300">
                  EcoCash
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-obsidian-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-obsidian-500 text-xs">
            &copy; {new Date().getFullYear()} MUFASA Gadgets & Accessories. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-obsidian-500 hover:text-gold-500 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-obsidian-500 hover:text-gold-500 text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
