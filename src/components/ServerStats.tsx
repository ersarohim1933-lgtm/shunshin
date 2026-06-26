import React, { useState, useEffect, useRef } from 'react';
import { SERVER_INFO } from '../data';
import { Server, Cpu, Wifi, Activity, Sparkles, Users, HardDrive, Terminal, Send, Skull, UserPlus, UserMinus, Info, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface PteroStats {
  online: boolean;
  cpu: number;
  ram: number;
  ramMax: number;
  disk: number;
  diskMax: number;
  state: string;
}

interface ServerStatus {
  online: boolean;
  currentPlayers: number;
  maxPlayers: number;
  onlinePlayers: string[];
  ptero?: PteroStats | null;
  error?: string;
}

interface LogItem {
  id: string;
  timestamp: string;
  type: "chat" | "join" | "leave" | "death" | "info";
  username?: string;
  message?: string;
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
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);

  // Chat and player logs states
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'chat' | 'events'>('all');
  const [chatUsername, setChatUsername] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shunshine_chat_username");
      if (saved) return saved;
      const randName = `Warga_Web_${Math.floor(Math.random() * 900 + 100)}`;
      localStorage.setItem("shunshine_chat_username", randName);
      return randName;
    }
    return `Warga_Web_${Math.floor(Math.random() * 900 + 100)}`;
  });
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real-time log stream from backend Express
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/server-logs');
      if (response.ok) {
        const data = await response.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.warn("Koneksi log server tidak tersedia atau berjalan statis:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of console terminal
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, logFilter]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setIsSendingChat(true);
    try {
      const response = await fetch('/api/send-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: chatUsername, message: chatMessage })
      });
      if (response.ok) {
        setChatMessage("");
        fetchLogs();
      }
    } catch (error) {
      console.error("Gagal mengirim pesan chat:", error);
    } finally {
      setIsSendingChat(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'chat') return log.type === 'chat';
    if (logFilter === 'events') return log.type === 'join' || log.type === 'leave' || log.type === 'death' || log.type === 'info';
    return true;
  });

  // Fetch server status from backend API, with fallback directly to public APIs on client side (for Vercel/static deploys)
  const fetchServerStatus = async () => {
    try {
      const res = await fetch('/api/server-status');
      if (!res.ok) {
        throw new Error(`Backend API returned status ${res.status}`);
      }
      const data = await res.json();
      if (typeof data.online !== 'boolean') {
        throw new Error('Invalid json from backend');
      }
      setStatus(data);
      setIsFallbackActive(false);
    } catch (e) {
      console.warn('Backend API tidak tersedia atau gagal (kemungkinan dideploy di Vercel/Hosting Statis). Mencoba fetch client-side langsung...', e);
      setIsFallbackActive(true);
      
      // Fallback 1: Fetch directly from public mcsrvstat API on the browser
      try {
        const publicRes = await fetch(`https://api.mcsrvstat.us/3/${SERVER_INFO.ip}`);
        if (!publicRes.ok) {
          throw new Error(`Public mcsrvstat returned ${publicRes.status}`);
        }
        const data = await publicRes.json();
        setStatus({
          online: data.online ?? false,
          currentPlayers: data.players?.online ?? 0,
          maxPlayers: data.players?.max ?? 20,
          onlinePlayers: data.players?.list?.map((p: any) => typeof p === 'string' ? p : p.name) ?? [],
        });
      } catch (publicError) {
        console.error('Fetch mcsrvstat gagal:', publicError);
        
        // Fallback 2: Fetch from minetools
        try {
          const altRes = await fetch(`https://api.minetools.eu/ping/${SERVER_INFO.ip}/19136`);
          if (altRes.ok) {
            const altData = await altRes.json();
            if (!altData.error) {
              setStatus({
                online: true,
                currentPlayers: altData.players?.online ?? 0,
                maxPlayers: altData.players?.max ?? 20,
                onlinePlayers: [],
              });
              return;
            }
          }
        } catch (altError) {
          console.error('Fetch minetools gagal:', altError);
        }

        // If all fail, mark as offline
        setStatus({
          online: false,
          currentPlayers: 0,
          maxPlayers: 20,
          onlinePlayers: [],
          error: 'Offline'
        });
      }
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

  // Fluctuating real-time RAM simulation / Pterodactyl integration
  useEffect(() => {
    if (isLoadingStatus) return;
    
    if (!status?.online) {
      setLiveRam(0.0);
      return;
    }

    if (status?.ptero) {
      setLiveRam(status.ptero.ram);
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
  }, [status?.online, status?.ptero, isLoadingStatus]);

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
                    / {isLoadingStatus ? "-" : status?.maxPlayers ?? SERVER_INFO.maxPlayers} Warga
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Maksimal Kapasitas: {status?.maxPlayers ?? SERVER_INFO.maxPlayers}</span>
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
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">{status?.ptero ? "Beban CPU Panel" : "TPS Server Realtime"}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl sm:text-3xl font-display font-bold ${status?.online ? 'text-emerald-400' : 'text-neutral-500'} tracking-tight`}>
                    {isLoadingStatus ? "-" : status?.ptero ? `${status.ptero.cpu.toFixed(1)}%` : liveTps.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 font-medium">{status?.ptero ? "" : "/ 20.0"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{status?.ptero ? `Status: ${status.ptero.state.toUpperCase()}` : `Status: ${status?.online ? "Sangat Stabil" : "Offline"}`}</span>
              </span>
              <span className="text-[10px] text-neutral-500">{status?.ptero ? `Disk: ${status.ptero.disk.toFixed(1)}/${status.ptero.diskMax} GB` : "Survival"}</span>
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
                  <span className="text-xs font-mono text-neutral-500 font-medium">/ {status?.ptero ? `${status.ptero.ramMax} GiB` : "3.0 GiB"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Alokasi: Max {status?.ptero ? `${status.ptero.ramMax} GiB` : "3 GiB"} RAM</span>
              </span>
              <span className="text-[10px] text-neutral-500">{status?.ptero ? "Realtime Panel" : "Standard RAM"}</span>
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

        {/* LIVE CHAT & CONSOLE WARGA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-neutral-950/70 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full" />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-neutral-800/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                <Terminal className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white tracking-wider flex items-center gap-2 uppercase">
                  Aktivitas & Chat Warga Realtime
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Terhubung langsung dengan log aktivitas player di dalam game
                </p>
              </div>
            </div>

            {/* Status & Filter Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Active Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                LIVE STREAM
              </div>

              {/* Filter buttons */}
              <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-3 py-1 rounded-md font-medium transition-all duration-200 cursor-pointer ${logFilter === 'all' ? 'bg-neutral-850 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setLogFilter('chat')}
                  className={`px-3 py-1 rounded-md font-medium transition-all duration-200 cursor-pointer ${logFilter === 'chat' ? 'bg-neutral-850 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setLogFilter('events')}
                  className={`px-3 py-1 rounded-md font-medium transition-all duration-200 cursor-pointer ${logFilter === 'events' ? 'bg-neutral-850 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                >
                  Join/Leave
                </button>
              </div>
            </div>
          </div>

          {/* Username Customize Panel */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-900/40 border border-neutral-800/40 p-3 rounded-xl">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5 font-sans">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Ingin nimbrung chat ke dalam server dari web? Set nama warga kamu di sini:
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
              <span className="text-neutral-500">@</span>
              <input
                type="text"
                maxLength={16}
                value={chatUsername}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                  setChatUsername(cleanVal);
                  localStorage.setItem("shunshine_chat_username", cleanVal);
                }}
                className="bg-neutral-900 border border-neutral-850 hover:border-neutral-800 focus:border-amber-500 focus:outline-none text-neutral-200 px-3 py-1.5 rounded-lg w-full sm:w-44 font-sans text-xs"
                placeholder="Set nama warga..."
              />
            </div>
          </div>

          {/* Terminal Log Box */}
          <div 
            ref={logContainerRef}
            className="bg-neutral-950/80 border border-neutral-900 rounded-2xl h-[260px] sm:h-[300px] overflow-y-auto p-4 font-mono text-[11px] flex flex-col gap-2.5 scrollbar-thin scrollbar-thumb-neutral-850 scrollbar-track-transparent scroll-smooth"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-neutral-500 text-center py-16 flex flex-col items-center justify-center gap-2 font-sans text-xs">
                <Terminal className="w-8 h-8 opacity-40 animate-pulse text-amber-400" />
                Belum ada rekaman aktivitas saat ini.
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeColor = "bg-neutral-850 text-neutral-400";
                let prefix = "[INFO]";
                let contentColor = "text-neutral-300";

                if (log.type === "join") {
                  badgeColor = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                  prefix = "➔ JOIN";
                  contentColor = "text-emerald-300/95";
                } else if (log.type === "leave") {
                  badgeColor = "bg-red-500/10 border border-red-500/20 text-red-400";
                  prefix = "⇠ LEAVE";
                  contentColor = "text-neutral-450";
                } else if (log.type === "death") {
                  badgeColor = "bg-rose-500/10 border border-rose-500/20 text-rose-400";
                  prefix = "☠ DEATH";
                  contentColor = "text-rose-300/90";
                } else if (log.type === "chat") {
                  badgeColor = "bg-amber-500/10 border border-amber-500/20 text-amber-400";
                  prefix = "💬 CHAT";
                  contentColor = "text-neutral-100";
                } else if (log.type === "info") {
                  badgeColor = "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400";
                  prefix = "📢 SYSTEM";
                  contentColor = "text-cyan-200/90";
                }

                return (
                  <div key={log.id} className="flex items-start gap-2.5 hover:bg-neutral-900/30 p-1.5 rounded-lg transition-all">
                    {/* Timestamp */}
                    <span className="text-neutral-600 select-none shrink-0 font-medium">
                      [{log.timestamp}]
                    </span>

                    {/* Badge */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 select-none ${badgeColor}`}>
                      {prefix}
                    </span>

                    {/* Content */}
                    <span className={`leading-relaxed break-all ${contentColor}`}>
                      {log.type === "chat" ? (
                        <>
                          <span className="text-amber-400 font-bold hover:underline cursor-pointer">
                            &lt;{log.username}&gt;
                          </span>
                          <span className="text-neutral-500 mx-1">:</span>
                          <span>{log.message}</span>
                        </>
                      ) : (
                        <span>{log.message}</span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
            <input
              type="text"
              required
              maxLength={100}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              disabled={isSendingChat}
              className="flex-1 bg-neutral-950/80 border border-neutral-900 text-xs text-white rounded-xl px-4 py-3 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 font-sans transition-all"
              placeholder={`Tulis pesan chat ke game... (@${chatUsername})`}
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatMessage.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-950 font-bold px-5 py-3 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {isSendingChat ? (
                <span className="animate-spin inline-block w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Kirim</span>
            </button>
          </form>
        </motion.div>

        {isFallbackActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 text-center text-xs font-mono text-amber-400/80 max-w-2xl mx-auto"
          >
            ⚠️ <strong>Catatan Hosting Statis:</strong> Web mendeteksi deploy statis (misal Vercel) tanpa active backend. Status server diambil via API publik yang ter-cache selama 5-10 menit. Jika Anda baru mematikan/menyalakan server di panel, harap tunggu beberapa menit agar statusnya terupdate di web.
          </motion.div>
        )}

      </div>
    </section>
  );
}
