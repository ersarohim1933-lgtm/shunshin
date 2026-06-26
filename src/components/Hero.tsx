import { useState } from 'react';
import { WHATSAPP_GROUP_LINK, DISCORD_LINK, SERVER_INFO } from '../data';
import { Copy, Check, Shield, Users, Compass, ChevronDown, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);

  const copyToClipboard = (text: string, type: 'java' | 'bedrock') => {
    navigator.clipboard.writeText(text);
    if (type === 'java') {
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2000);
    } else {
      setCopiedBedrock(true);
      setTimeout(() => setCopiedBedrock(false), 2000);
    }
  };

  const scrollToNextSection = () => {
    const element = document.getElementById('fitur');
    if (element) {
      const offset = 80;
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
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      
      {/* Background Image with Deep Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/sunshine_hero_1782281566632.jpg"
          alt="Shunshine Minecraft Landscape"
          className="w-full h-full object-cover scale-102 filter brightness-[0.35]"
          referrerPolicy="no-referrer"
        />
        {/* Radial amber glow & bottom dark blend */}
        <div className="absolute inset-0 bg-radial-at-c from-amber-500/10 via-neutral-950/50 to-neutral-950" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>

      {/* Decorative Gold Light Ray */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-1" />

      {/* Hero Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Live Badge Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/40 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-mono tracking-wider font-semibold text-amber-300 uppercase">
            SHUNSHINE SERVER ONLINE • VERSION {SERVER_INFO.version}
          </span>
        </motion.div>

        {/* Epic Headings */}
        <div className="max-w-4xl mx-auto mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1] mb-6"
          >
            Sinar Penerang <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-glow-gold">
              Minecraft
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-sans font-light leading-relaxed"
          >
            Selamat datang di <strong className="text-amber-400 font-semibold">Shunshine Server</strong>. Temukan dunia survival terbaik, komunitas ramah yang diintegrasikan secara eksklusif dengan WhatsApp, dan sistem ekonomi berkeadilan.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {/* Main Join Discord */}
          <a
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-7 py-4 rounded-xl text-base shadow-[0_0_30px_rgba(88,101,242,0.2)] hover:shadow-[0_0_35px_rgba(88,101,242,0.4)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            Gabung Discord Resmi
          </a>

          {/* Main Join Group WhatsApp */}
          <a
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-7 py-4 rounded-xl text-base shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            Gabung Grup WhatsApp
          </a>
          
          {/* Secondary Scroll to Stepper */}
          <button
            onClick={() => {
              const element = document.getElementById('cara-join');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900/85 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-medium px-7 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-sm"
          >
            Lihat Panduan
          </button>
        </motion.div>

        {/* Direct Connect Server IP Copy Boxes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 px-2"
        >
          
          {/* JAVA EDITION COPY COMPONENT */}
          <div className="relative group bg-neutral-900/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left w-full md:w-auto">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold block mb-1">
                JAVA EDITION (PC / LAPTOP)
              </span>
              <h3 className="font-display font-bold text-lg text-neutral-100 flex items-center gap-1.5">
                {SERVER_INFO.ip}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Default Port: <span className="text-neutral-200">{SERVER_INFO.portJava}</span>
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(SERVER_INFO.ip, 'java')}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                copiedJava
                  ? 'bg-green-500 text-neutral-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700'
              }`}
            >
              {copiedJava ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  TERSALIN!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  SALIN IP
                </>
              )}
            </button>
          </div>

          {/* BEDROCK EDITION COPY COMPONENT */}
          <div className="relative group bg-neutral-900/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left w-full md:w-auto">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold block mb-1">
                BEDROCK / PE (MOBILE / ANDROID / IOS)
              </span>
              <h3 className="font-display font-bold text-lg text-neutral-100">
                {SERVER_INFO.ip}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Port Bedrock: <span className="text-amber-400 font-semibold">{SERVER_INFO.portBedrock}</span>
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`${SERVER_INFO.ip}:${SERVER_INFO.portBedrock}`, 'bedrock')}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                copiedBedrock
                  ? 'bg-green-500 text-neutral-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700'
              }`}
            >
              {copiedBedrock ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  TERSALIN!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  SALIN IP
                </>
              )}
            </button>
          </div>

        </motion.div>

        {/* Small Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-xs text-neutral-500 mt-6 font-mono max-w-lg mx-auto"
        >
          *Catatan: Sangat disarankan bergabung ke Grup WhatsApp untuk koordinasi faksi, event seru, dan bersosialisasi dengan komunitas Shunshine.
        </motion.p>

        {/* Animated Chevron Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 flex flex-col items-center gap-2 text-neutral-500 hover:text-amber-400 cursor-pointer"
          onClick={scrollToNextSection}
        >
          <span className="text-xs font-mono tracking-widest uppercase">Eksplor Server</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.div>

      </div>
    </section>
  );
}
