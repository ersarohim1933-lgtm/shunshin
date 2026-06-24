import { useState, useEffect } from 'react';
import { SERVER_INFO } from '../data';
import { Server, Cpu, Wifi, Activity, Sparkles, Users, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

interface ServerStatus {
  online: boolean;
  currentPlayers: number;
  maxPlayers: number;
  onlinePlayers: string[];
  error?: string;
}

export default function ServerStats() {
  const [pingRegion, setPingRegion] = useState<string>('default');
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Live status states
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [liveTps, setLiveTps] = useState<number>(20.0);
  const [liveRam, setLiveRam] = useState<number>(0.0);

  // Fetch server status from backend API
  const fetchServerStatus = async () => {
    try {
      const res = await fetch('/api/server-status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setStatus({
        online: false,
        currentPlayers: 0,
        maxPlayers: 20,
        onlinePlayers: [],
        error: 'Offline'
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuating real-time TPS simulation
  useEffect(() => {
    if (isLoadingStatus) return;
    
    if (!status?.online) {
      setLiveTps(0.0);
      return;
    }

    // Set initial realistic value
    setLiveTps(parseFloat((19.95 + Math.random() * 0.05).toFixed(2)));

    const tpsInterval = setInterval(() => {
      // Simulate highly realistic high-performance TPS fluctuations between 19.92 and 20.00
      const randomFluctuation = parseFloat((19.94 + Math.random() * 0.06).toFixed(2));
      setLiveTps(randomFluctuation);
    }, 2500);

    return () => clearInterval(tpsInterval);
  }, [status?.online, isLoadingStatus]);

  // Fluctuating real-time RAM simulation
  useEffect(() => {
    if (isLoadingStatus) return;
    
    if (!status?.online) {
      setLiveRam(0.0);
      return;
    }

    // Set initial realistic value around 1.04 GiB (as shown in panel screenshot)
    setLiveRam(parseFloat((1.01 + Math.random() * 0.06).toFixed(2)));

    const ramInterval = setInterval(() => {
      // Simulate highly realistic micro RAM fluctuations (+/- 0.02 GiB)
      setLiveRam(prev => {
        const fluctuation = parseFloat((Math.random() * 0.04 - 0.02).toFixed(2));
        const nextVal = prev + fluctuation;
        // Keep within realistic bounds of 0.95 GiB - 1.25 GiB
        if (nextVal < 0.95) return 0.98;
        if (nextVal > 1.25) return 1.22;
        return parseFloat(nextVal.toFixed(2));
      });
    }, 4000);

    return () => clearInterval(ramInterval);
  }, [status?.online, isLoadingStatus]);

  // Ping test trigger simulator
  const handlePingTest = (region: string) => {
    setPingRegion(region);
    setIsPinging(true);
    setPingResult(null);

    let basePing = 12;
    if (region === 'jakarta') basePing = 8;
    else if (region === 'jawa') basePing = 16;
    else if (region === 'sumatera') basePing = 24;
    else if (region === 'sulawesi') basePing = 38;
    else if (region === 'kalimantan') basePing = 28;
    else if (region === 'papua') basePing = 65;

    setTimeout(() => {
      setIsPinging(false);
      setPingResult(basePing + Math.floor(Math.random() * 8));
    }, 1200);
  };

  return (
    <section className="relative py-16 bg-neutral-900/30 border-y border-neutral-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          
          {/* STAT 1: SERVER STATUS */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${status?.online ? 'bg-green-500/10 text-green-400' : isLoadingStatus ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Status Server</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {isLoadingStatus ? (
                    <span className="text-2xl font-display font-bold text-amber-400 tracking-tight animate-pulse">MEMUAT...</span>
                  ) : status?.online ? (
                    <span className="text-3xl font-display font-bold text-green-400 tracking-tight">ONLINE</span>
                  ) : (
                    <span className="text-3xl font-display font-bold text-red-400 tracking-tight">OFFLINE</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
              {status?.online ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-neutral-300">Siap dimainkan kapan saja</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="font-mono text-neutral-400">Sedang pemeliharaan / offline</span>
                </>
              )}
            </div>
          </motion.div>

          {/* STAT 2: PLAYERS ONLINE COUNT */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Pemain Aktif</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-display font-bold text-white">
                    {isLoadingStatus ? "-" : status?.currentPlayers ?? 0}
                  </span>
                  <span className="text-sm text-neutral-500">
                    / {isLoadingStatus ? "-" : status?.maxPlayers ?? 20} Warga
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Maksimal Kapasitas: {status?.maxPlayers ?? 20}</span>
              {status?.onlinePlayers && status.onlinePlayers.length > 0 && (
                <span className="text-amber-400 text-[10px] animate-pulse">Warga aktif bermain!</span>
              )}
            </div>
          </motion.div>

          {/* STAT 3: SERVER TPS PERFORMANCE */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${status?.online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">TPS Server Realtime</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl sm:text-3xl font-display font-bold ${status?.online ? 'text-emerald-400' : 'text-neutral-500'} tracking-tight`}>
                    {isLoadingStatus ? "-" : liveTps.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 font-medium">/ 20.0</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status: {status?.online ? "Sangat Stabil" : "Offline"}</span>
              </span>
              <span className="text-[10px] text-neutral-500">Survival</span>
            </div>
          </motion.div>

          {/* STAT 4: RAM USAGE */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${status?.online ? 'bg-purple-500/10 text-purple-400' : 'bg-neutral-800 text-neutral-500'}`}>
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Penggunaan RAM</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl sm:text-3xl font-display font-bold ${status?.online ? 'text-purple-400' : 'text-neutral-500'} tracking-tight`}>
                    {isLoadingStatus ? "-" : liveRam.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 font-medium">/ 3.0 GiB</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Alokasi: Max 3 GiB RAM</span>
              </span>
              <span className="text-[10px] text-neutral-500">Standard RAM</span>
            </div>
          </motion.div>

          {/* STAT 4: LATENCY CHECKER WIDGET */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400">
                <Wifi className="w-6 h-6" />
              </div>
              <div className="w-full">
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Uji Latensi</span>
                <div className="mt-1 flex gap-1.5 w-full">
                  <select
                    onChange={(e) => handlePingTest(e.target.value)}
                    value={pingRegion}
                    className="bg-neutral-900 text-xs font-sans text-neutral-200 border border-neutral-800 rounded px-2 py-1 w-full focus:outline-none focus:border-amber-500/80 cursor-pointer"
                  >
                    <option value="default" disabled>Pilih Daerahmu...</option>
                    <option value="jakarta">Jakarta / JABODETABEK</option>
                    <option value="jawa">Jawa Barat/Tengah/Timur</option>
                    <option value="sumatera">Sumatera & Sekitarnya</option>
                    <option value="kalimantan">Kalimantan & Sekitarnya</option>
                    <option value="sulawesi">Sulawesi & Sekitarnya</option>
                    <option value="papua">Papua & Maluku</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulated latency results */}
            <div className="mt-3.5 h-5 flex items-center justify-between text-xs font-mono text-neutral-400">
              {isPinging ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="animate-spin inline-block w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                  Menguji sinyal...
                </span>
              ) : pingResult !== null ? (
                <div className="flex justify-between items-center w-full">
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {pingResult} ms
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                    {pingResult < 20 ? 'Sangat Lancar' : pingResult < 45 ? 'Stabil' : 'Cukup Baik'}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-500">Pilih daerah untuk cek ping</span>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
