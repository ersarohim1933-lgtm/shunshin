import { JOIN_STEPS, WHATSAPP_GROUP_LINK } from '../data';
import { MessageCircle, Send, Clipboard, Gamepad, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const getStepIcon = (stepNum: number) => {
  switch (stepNum) {
    case 1:
      return <MessageCircle className="w-6 h-6 text-green-400" />;
    case 2:
      return <Send className="w-5 h-5 text-amber-400" />;
    case 3:
      return <Clipboard className="w-5 h-5 text-neutral-300" />;
    case 4:
      return <Gamepad className="w-5 h-5 text-amber-500 animate-pulse" />;
    default:
      return <HelpCircle className="w-5 h-5 text-neutral-300" />;
  }
};

export default function HowToJoin() {
  return (
    <section id="cara-join" className="relative py-24 bg-neutral-900/10 border-t border-neutral-900/60">
      
      {/* Absolute Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold">
            TUTORIAL BERGABUNG
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mt-2 mb-4">
            Cara Bergabung ke Shunshine Server
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded-full mb-6" />
          <p className="text-neutral-400 font-sans font-light text-base sm:text-lg">
            Sangat mudah untuk memulai! Tidak ada proses whitelist yang rumit. Cukup ikuti langkah-langkah sederhana di bawah ini untuk terhubung.
          </p>
        </div>

        {/* Content Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT PANEL: Community Notice Card */}
          <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-8 shadow-xl glow-gold">
            <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold block mb-2">
              PENTING DIKETAHUI
            </span>
            <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-4">
              Mengapa Harus Masuk Grup WhatsApp?
            </h3>
            
            <p className="text-sm text-neutral-300 font-sans leading-relaxed mb-6 font-light">
              Grup WhatsApp Shunshine adalah pusat berkumpulnya para petualang. Masuk ke grup WhatsApp berfungsi sebagai:
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span className="text-neutral-300 font-light">
                  <strong className="text-neutral-100 font-medium">Informasi Terupdate:</strong> Dapatkan pengumuman mengenai update server, event mingguan, pemeliharaan berkala, dan penyesuaian aturan langsung dari admin.
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span className="text-neutral-300 font-light">
                  <strong className="text-neutral-100 font-medium">Interaksi & Trading:</strong> Tempat mengobrol santai dengan warga lain, mempromosikan tokomu, melakukan jual beli barang, serta merekrut anggota faksi/aliansi baru.
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </span>
                <span className="text-neutral-300 font-light">
                  <strong className="text-neutral-100 font-medium">Bantuan & Koordinat:</strong> Jika Anda tersesat, butuh bantuan darurat di dalam game, atau menemukan kendala teknis, moderator dan komunitas kami siap membantu dengan cepat.
                </span>
              </li>
            </ul>

            <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-start gap-4">
              <MessageCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono text-green-400 uppercase font-bold tracking-wider">
                  LINK GRUP WHATSAPP RESMI
                </h4>
                <p className="text-xs text-neutral-400 font-sans font-light mt-1">
                  Bergabunglah melalui tautan resmi WhatsApp untuk berdiskusi, koordinasi faksi, dan mendapatkan kabar terbaru langsung dari Admin Shunshine.
                </p>
                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                >
                  Masuk Grup WA <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Timeline Stepper */}
          <div className="lg:col-span-7 space-y-6">
            {JOIN_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`relative bg-neutral-950/65 border rounded-2xl p-6 md:p-8 flex items-start gap-5 transition-all duration-300 ${
                  step.step === 1 
                    ? 'border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                    : 'border-neutral-800/80'
                }`}
              >
                
                {/* Step Number with icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-md ${
                  step.step === 1
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                }`}>
                  {getStepIcon(step.step)}
                </div>

                {/* Step Info Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                      step.step === 1 ? 'text-green-400' : 'text-amber-500'
                    }`}>
                      LANGKAH {step.step}
                    </span>
                    {step.step === 1 && (
                      <span className="bg-green-500/15 text-green-400 text-[9px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full">
                        WAJIB
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-display font-bold text-lg md:text-xl text-neutral-100 mt-1 mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-400 font-sans font-light leading-relaxed">
                    {step.description}
                  </p>

                  {/* Render CTA link if step 1 */}
                  {step.ctaText && step.ctaLink && (
                    <div className="mt-4">
                      <a
                        href={step.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-neutral-950 font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        {step.ctaText}
                      </a>
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
