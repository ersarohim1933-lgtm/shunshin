import Header from './components/Header';
import Hero from './components/Hero';
import ServerStats from './components/ServerStats';
import Features from './components/Features';
import HowToJoin from './components/HowToJoin';
import Rules from './components/Rules';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Premium Floating Header */}
      <Header />
      
      {/* Landing Content Page Sections */}
      <main className="flex-grow">
        
        {/* Hero Section with epic landscape background */}
        <Hero />
        
        {/* Dynamic Performance & Latency Stats Bar */}
        <ServerStats />
        
        {/* Bento Grid highlighting server plugins & features */}
        <Features />
        
        {/* Step-by-Step Join Tutorial with WhatsApp focus */}
        <HowToJoin />
        
        {/* Collapsible Accordion Rules & Guidelines */}
        <Rules />
        
        {/* Interactive Community Screenshot Gallery (Firebase Integrated) */}
        <Gallery />
        
      </main>

      {/* Elegant Footer & Connection Guide */}
      <Footer />
      
    </div>
  );
}

