import { Menu, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Rooms", href: "#rooms" },
  { label: "Restaurant", href: "#restaurant" },
  { label: "Banquet", href: "#banquet" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

interface HeaderProps {
  onBookNow: () => void;
}

export default function Header({ onBookNow }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100"
          : "bg-white/90 backdrop-blur-sm shadow-sm"
      }`}
    >
      {/* Top bar */}
      <div className="bg-gray-50 border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4 py-1.5 flex justify-between items-center text-xs">
          <span className="text-gray-700">
            Near Main Road, Begusarai, Bihar - 851101
          </span>
          <div className="flex items-center gap-4 text-gray-700">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-amber-600 transition-colors"
            >
              <Phone size={12} />
              +91 98765 43210
            </a>
            <span>|</span>
            <a
              href="mailto:info@hotelkdmpalace.com"
              className="hover:text-amber-600 transition-colors"
            >
              info@hotelkdmpalace.com
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavClick("#home")}
          className="flex flex-col leading-none text-left"
        >
          <span className="font-serif text-xl md:text-2xl font-bold text-amber-600 tracking-wide">
            HOTEL KDM PALACE
          </span>
          <span className="text-xs tracking-[0.3em] text-gray-600 uppercase">
            Begusarai, Bihar
          </span>
        </button>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex items-center gap-6"
          data-ocid="header.nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="text-sm tracking-wide text-gray-600 hover:text-amber-600 transition-colors duration-200 uppercase font-medium"
              data-ocid={`nav.${link.label.toLowerCase()}.link`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            className="btn-gold text-sm"
            onClick={onBookNow}
            data-ocid="header.book_now.button"
          >
            Book Now
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="lg:hidden text-amber-600 p-2 rounded-lg hover:bg-amber-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          data-ocid="header.mobile_menu.button"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-sm tracking-widest uppercase py-3 border-b border-gray-100 text-gray-600 hover:text-amber-600 transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                className="btn-gold text-sm mt-3 w-full"
                onClick={() => {
                  setMenuOpen(false);
                  onBookNow();
                }}
                data-ocid="header.mobile_book_now.button"
              >
                Book Now
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
