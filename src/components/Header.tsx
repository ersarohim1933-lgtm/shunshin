import { useState, useEffect } from 'react';
import { WHATSAPP_GROUP_LINK, DISCORD_LINK } from '../data';
import { Menu, X, ExternalLink, Flame, MessageSquare, Image } from 'lucide-react';
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
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 85; // height of fixed navbar
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? 'bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/60 py-3 shadow-lg'
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
                alt="Shunshine Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-wider text-neutral-100 group-hover:text-amber-400 transition-colors">
                SHUNSHINE
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

            <button 
              onClick={() => scrollToSection('gallery')} 
              className="text-sm font-medium text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Galeri Komunitas
            </button>

            <a 
              href="https://minecraft-mp.com/server/359813/vote/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Vote Server
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Desktop CTA Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-[0_0_15px_rgba(88,101,242,0.15)] hover:shadow-[0_0_20px_rgba(88,101,242,0.3)]"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              Discord
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
            
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
              Grup WA
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => scrollToSection('gallery')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs cursor-pointer transition-all hover:bg-amber-500/20"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Galeri</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-900/60 transition-colors cursor-pointer relative z-50"
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
            className="md:hidden bg-neutral-950 border-b border-neutral-800 overflow-hidden"
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

              <button
                onClick={() => scrollToSection('gallery')}
                className="block w-full text-left py-2.5 px-3 rounded-lg text-base font-medium text-neutral-300 hover:bg-neutral-900 hover:text-amber-400 transition-all cursor-pointer"
              >
                Galeri Komunitas
              </button>

              <a
                href="https://minecraft-mp.com/server/359813/vote/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-amber-400 hover:bg-neutral-900 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Vote Server</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="pt-4 border-t border-neutral-900 flex flex-col gap-3">
                <a
                  href={DISCORD_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-4 rounded-xl shadow-lg w-full transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Gabung Server Discord
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold py-3 px-4 rounded-xl shadow-lg w-full cursor-pointer"
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
