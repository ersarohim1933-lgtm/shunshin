import { Feature, JoinStep, ServerRule, ServerInfo, GalleryItem } from './types';

export const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/D9cijRhTVNm3pBupyVp5Hk?s=cl&p=a&mlu=1&amv=3";

export const SERVER_INFO: ServerInfo = {
  ip: "play.shunshine.qzz.io",
  portJava: 19136,
  portBedrock: 19136,
  version: "1.20.x - 1.21.x (Versi Terbaru)",
  maxPlayers: 200,
  currentPlayers: 48, // Live-looking simulator
  status: "online"
};

export const FEATURES: Feature[] = {
  id: "features-list",
  get values(): Feature[] {
    return [
      {
        id: "feat-1",
        title: "Dunia Survival Semi-Vanilla",
        description: "Petualangan survival murni yang disempurnakan dengan bumbu plugin berkualitas. Menjaga cita rasa asli Minecraft sembari memberikan kenyamanan bermain jangka panjang.",
        iconName: "Compass"
      },
      {
        id: "feat-2",
        title: "Komunitas Ramah & Dewasa",
        description: "Melalui penyaringan WhatsApp Group, kami memastikan lingkungan bermain yang bebas toxic, suportif, inklusif, dan mengedepankan rasa hormat antar sesama pemain.",
        iconName: "Users"
      },
      {
        id: "feat-3",
        title: "Ekonomi Seimbang (Player Shops)",
        description: "Berdaganglah secara bebas dengan pemain lain! Dirikan tokomu sendiri di area pasar, pasang harga terbaik, dan jadilah saudagar paling kaya di Shunshine.",
        iconName: "Coins"
      },
      {
        id: "feat-4",
        title: "Crossplay Mobile & PC (Bedrock & Java)",
        description: "Dunia petualangan tanpa sekat. Hubungkan PC kamu (Java Edition) maupun HP/Tablet kamu (Bedrock / Pocket Edition) ke satu dunia yang sama dengan mulus.",
        iconName: "Smartphone"
      },
      {
        id: "feat-5",
        title: "Kebebasan Survival (Bebas Griefing)",
        description: "Ekspresikan dirimu sepenuhnya! Di server Shunshine, tidak ada aturan proteksi lahan yang kaku. Semua pemain bebas melakukan griefing, raiding, dan menjarah untuk bertahan hidup.",
        iconName: "ShieldCheck"
      },
      {
        id: "feat-6",
        title: "Event Seru & Pertempuran Kreatif",
        description: "Setiap akhir pekan, ikuti tantangan seru bersama komunitas! Mulai dari ajang unjuk kekuatan, bertahan hidup dari monster kustom, hingga kolaborasi pertahanan faksi.",
        iconName: "Sparkles"
      }
    ];
  }
}["values"];

export const JOIN_STEPS: JoinStep[] = [
  {
    step: 1,
    title: "Gabung Grup WhatsApp",
    description: "Langkah terbaik untuk memulai! Masuk ke komunitas utama Shunshine terlebih dahulu karena segala koordinasi, diskusi faksi, trading barang, dan pembaruan penting diumumkan di grup ini.",
    ctaText: "Gabung Grup WA Sekarang",
    ctaLink: WHATSAPP_GROUP_LINK
  },
  {
    step: 2,
    title: "Salin IP & Port Server",
    description: "Salin IP server: play.shunshine.qzz.io dengan Port: 19136. Port ini sama untuk pemain Java (PC) maupun Bedrock / Pocket Edition (HP)."
  },
  {
    step: 3,
    title: "Masuk & Mulai Petualangan",
    description: "Buka Minecraft Anda, tambahkan server baru dengan informasi di atas, lalu klik hubungkan untuk langsung menikmati dunia survival seru bersama warga lainnya secara gratis!"
  }
];

export const SERVER_RULES: ServerRule[] = [
  {
    id: "rule-1",
    title: "Hormati Sesama Pemain (Zero Tolerance Toxic)",
    description: "Kami sangat menjaga kenyamanan bermain. Dilarang keras melakukan penghinaan, rasisme (SARA), pelecehan, intimidasi, atau memicu drama negatif baik di dalam game maupun di grup WhatsApp."
  },
  {
    id: "rule-3",
    title: "Main Bersih & Jujur (No Cheat/Exploit)",
    description: "Penggunaan client modifikasi ilegal (X-ray, Fly, KillAura, dll), eksploitasi bug sistem, duplikasi item (dupe), dan botting akan berujung pada hukuman ban permanen tanpa ampun."
  },
  {
    id: "rule-4",
    title: "Dilarang Spamming & Iklan",
    description: "Dilarang mempromosikan server Minecraft lain, memposting link berbahaya, atau melakukan spam chat berulang-ulang di grup komunikasi dan konsol permainan."
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [];
