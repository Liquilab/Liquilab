import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  const footerLinks = [
    { path: "/pricing", label: "Pricing" },
    { path: "/faq", label: "FAQ" },
    { path: "/rangeband", label: "Docs" },
  ];

  return (
    <footer className="border-t border-white/5 bg-[#0B1530]/95">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />
          
          {/* Links */}
          <div className="flex items-center gap-1">
            {footerLinks.map((link, index) => (
              <span key={link.path} className="flex items-center gap-1">
                <Link 
                  to={link.path}
                  className="text-white/70 hover:text-[#3B82F6] transition-colors px-3 py-1"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-white/20">·</span>
                )}
              </span>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="text-white/[0.58]">
            © 2024 Liquilab
          </div>
        </div>
      </div>
    </footer>
  );
}