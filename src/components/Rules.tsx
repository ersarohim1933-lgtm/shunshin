import { useState } from 'react';
import { SERVER_RULES } from '../data';
import { Shield, ChevronDown, BookOpen, AlertTriangle, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Rules() {
  const [expandedId, setExpandedId] = useState<string | null>("rule-1");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="aturan" className="relative py-24 bg-neutral-900/10 border-t border-neutral-900/60">
      
      {/* Decorative vector meshes */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:16px_16px] opacity-25 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold">
            KONSTITUSI SERVER
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mt-2 mb-4">
            Aturan Bermain di Sunshine
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded-full mb-6" />
          <p className="text-neutral-400 font-sans font-light text-sm sm:text-base max-w-2xl mx-auto">
            Demi menjaga kenyamanan dan sportivitas seluruh warga Sunshine, setiap pemain berkewajiban untuk mematuhi dan menegakkan peraturan utama di bawah ini.
          </p>
        </div>

        {/* Rules Accordions */}
        <div className="space-y-4 mb-12">
          {SERVER_RULES.map((rule, idx) => {
            const isExpanded = expandedId === rule.id;
            return (
              <div
                key={rule.id}
                className={`bg-neutral-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-amber-500/40 shadow-lg' : 'border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                
                {/* Header click bar */}
                <button
                  onClick={() => toggleExpand(rule.id)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                      isExpanded ? 'bg-amber-500/10 text-amber-400' : 'bg-neutral-950 text-neutral-400'
                    }`}>
                      0{idx + 1}
                    </div>
                    <h3 className="font-display font-bold text-base md:text-lg text-neutral-100 hover:text-white transition-colors">
                      {rule.title}
                    </h3>
                  </div>

                  <div className={`text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Animated Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-neutral-900/50">
                        <p className="text-sm text-neutral-300 font-sans font-light leading-relaxed pl-12">
                          {rule.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

        {/* Warning Banner */}
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4 text-left">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              SANKSI PELANGGARAN
            </h4>
            <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed mt-1">
              Admin Sunshine berhak memberikan sanksi berupa teguran keras, pembersihan inventaris (inventory wipe), penyitaan lahan klaim, hingga pemblokiran permanen (Banned) dari server dan grup WhatsApp terhadap pemain yang terbukti melanggar aturan di atas demi kelangsungan keharmonisan komunitas.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
