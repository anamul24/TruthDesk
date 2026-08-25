import React from "react";
import Link from "next/link";
import { playfair } from "@/app/layout";
import { FaFacebook, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

const footerLinks = {
  News: [
    { label: "Bangladesh", href: "/category/bangladesh" },
    { label: "Politics", href: "/category/politics" },
    { label: "Sports", href: "/category/sports" },
    { label: "Technology", href: "/category/technology" },
    { label: "International", href: "/category/international" },
    { label: "Entertainment", href: "/category/entertainment" },
  ],
  Company: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/career" },
  ],
  Editorial: [
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Corrections Policy", href: "/editorial-policy#corrections" },
    { label: "Source Policy", href: "/editorial-policy#sources" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
  ],
};

const socialLinks = [
  { icon: FaFacebook, label: "Facebook", href: "https://facebook.com", color: "hover:text-blue-400" },
  { icon: FaYoutube, label: "YouTube", href: "https://youtube.com", color: "hover:text-red-400" },
  { icon: FaInstagram, label: "Instagram", href: "https://instagram.com", color: "hover:text-pink-400" },
  { icon: FaTwitter, label: "X / Twitter", href: "https://twitter.com", color: "hover:text-sky-400" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 100%)" }}
      className="text-slate-400"
    >
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="block mb-4">
              <span
                className={`${playfair.className} text-3xl font-black text-white tracking-tight`}
                style={{ letterSpacing: "-1px" }}
              >
                TruthDesk
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Bangladesh&apos;s trusted digital news platform. Independent. Accurate. Accountable.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`text-slate-500 ${s.color} transition-colors`}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>© {currentYear} TruthDesk. All rights reserved.</span>
          <span>Made in Bangladesh 🇧🇩</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
