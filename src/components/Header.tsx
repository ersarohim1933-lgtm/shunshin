import { useState, useEffect } from 'react';
import { WHATSAPP_GROUP_LINK } from '../data';
import { Menu, X, ExternalLink, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to add backdrop-blur to header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/60 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-115">
              <img 
                src="/src/assets/images/sunshine_logo_1782281585072.jpg" 
                alt="Sunshine Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-wider text-neutral-100 group-hover:text-amber-400 transition-colors">
                SUNSHINE
              </span>
              <span className="text-[9px] font-mono tracking-widest text-amber-500/90 uppercase font-semibold">
                Minecraft Server
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('fitur')} 
              className="text-sm font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Fitur Utama
            </button>
            <button 
              onClick={() => scrollToSection('cara-join')} 
              className="text-sm font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Cara Bermain
            </button>

            <button 
              onClick={() => scrollToSection('aturan')} 
              className="text-sm font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Aturan Server
            </button>
          </nav>

          {/* Desktop CTA Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              Gabung Grup WA
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-900/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar/Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-neutral-950 border-b border-neutral-800"
          >
            <div className="px-4 pt-3 pb-6 space-y-4">
              <button
                onClick={() => scrollToSection('fitur')}
                className="block w-full text-left py-2.5 px-3 rounded-lg text-base font-medium text-neutral-300 hover:bg-neutral-900 hover:text-amber-400 transition-all cursor-pointer"
              >
                Fitur Utama
              </button>
              <button
                onClick={() => scrollToSection('cara-join')}
                className="block w-full text-left py-2.5 px-3 rounded-lg text-base font-medium text-neutral-300 hover:bg-neutral-900 hover:text-amber-400 transition-all cursor-pointer"
              >
                Cara Bermain
              </button>

              <button
                onClick={() => scrollToSection('aturan')}
                className="block w-full text-left py-2.5 px-3 rounded-lg text-base font-medium text-neutral-300 hover:bg-neutral-900 hover:text-amber-400 transition-all cursor-pointer"
              >
                Aturan Server
              </button>
              
              <div className="pt-4 border-t border-neutral-900">
                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold py-3 px-4 rounded-xl shadow-lg w-full"
                >
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  Gabung Grup WA
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
