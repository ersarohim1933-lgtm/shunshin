import { WHATSAPP_GROUP_LINK, DISCORD_LINK, SERVER_INFO } from '../data';
import { Flame, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-12 relative overflow-hidden">
      
      {/* Decorative vertical divider line at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-gradient-to-b from-neutral-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-neutral-900 pb-10">
          
          {/* Logo Brand Name & Tagline */}
          <div className="md:col-span-5 flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-3">
              <div 
                onClick={handleScrollToTop}
                className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/40 cursor-pointer hover:scale-105 transition-transform"
              >
                <img 
                  src="/src/assets/images/sunshine_logo_1782281585072.jpg" 
                  alt="Shunshine Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white">
                SHUNSHINE SERVER
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed max-w-sm">
              Membawa sinar kehangatan petualangan ke genggaman Anda. Tempat terbaik mengukir sejarah survival bersama teman-teman tepercaya.
            </p>
          </div>

          {/* Quick Connection Details */}
          <div className="md:col-span-4 text-center sm:text-left">
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">
              KONEKSI SERVER
            </span>
            <div className="mt-2 space-y-1 text-xs font-mono text-neutral-400">
              <p>Server IP: <span className="text-neutral-200 font-bold">{SERVER_INFO.ip}</span></p>
              <p>Java Port: <span className="text-neutral-200">{SERVER_INFO.portJava}</span></p>
              <p>Bedrock Port: <span className="text-amber-400 font-semibold">{SERVER_INFO.portBedrock}</span></p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col gap-3 justify-center sm:justify-end items-stretch sm:items-center md:items-end">
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-850 text-[#7289da] hover:text-[#5865F2] border border-[#5865F2]/30 hover:border-[#5865F2]/50 text-xs font-bold py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(88,101,242,0.1)] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current text-[#7289da]" />
              Gabung Discord Resmi
            </a>

            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-850 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 text-xs font-bold py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current text-green-400" />
              Gabung Grup WhatsApp
            </a>
          </div>

        </div>

        {/* Bottom Credits section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} Shunshine Minecraft Server. All Rights Reserved.</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" />
            <span>untuk Komunitas Indonesia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
