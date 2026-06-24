import { FEATURES } from '../data';
import { Compass, Users, Coins, Smartphone, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

// Safe mapping for Lucide icons
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Compass':
      return <Compass className="w-6 h-6" />;
    case 'Users':
      return <Users className="w-6 h-6" />;
    case 'Coins':
      return <Coins className="w-6 h-6" />;
    case 'Smartphone':
      return <Smartphone className="w-6 h-6" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-6 h-6" />;
    case 'Sparkles':
      return <Sparkles className="w-6 h-6" />;
    default:
      return <Trophy className="w-6 h-6" />;
  }
};

export default function Features() {
  return (
    <section id="fitur" className="relative py-24 bg-neutral-950">
      
      {/* Absolute Decorative Glow behind the grid */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold">
            KEUNGGULAN SHUNSHINE
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mt-2 mb-4">
            Mengapa Kamu Harus Bermain di Shunshine?
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded-full mb-6" />
          <p className="text-neutral-400 font-sans font-light text-base sm:text-lg">
            Kami mendedikasikan infrastruktur dan tim moderator terbaik untuk menghadirkan pengalaman bermain Minecraft survival terbaik yang seru, seimbang, dan berkesan.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, borderColor: 'rgba(245, 158, 11, 0.4)' }}
              className="group relative bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-8 hover:bg-neutral-900/60 transition-all duration-300 shadow-lg flex flex-col justify-between"
            >
              {/* Radial subtle hover lighting inside cards */}
              <div className="absolute inset-0 bg-radial-at-t from-amber-500/0 via-transparent to-transparent group-hover:from-amber-500/5 transition-all duration-500 rounded-2xl pointer-events-none" />
              
              <div>
                {/* Glowing Icon Wrapper */}
                <div className="inline-flex items-center justify-center p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-amber-400 mb-6 group-hover:text-amber-300 group-hover:border-amber-500/30 transition-all duration-300 shadow-md">
                  {getIconComponent(feature.iconName)}
                </div>

                {/* Feature Title */}
                <h3 className="font-display font-bold text-xl text-neutral-100 group-hover:text-white transition-colors mb-3">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-sm text-neutral-400 font-sans font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Elegant bottom accent line */}
              <div className="w-0 group-hover:w-16 h-0.5 bg-amber-500/70 transition-all duration-300 mt-6 rounded-full" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
