import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import net from "net";
import dgram from "dgram";

// Helper to check if TCP port is open (e.g., for Java/Geyser players)
function pingMinecraftPort(host: string, port: number, timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
      socket.destroy();
    });

    socket.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
      socket.destroy();
    });

    socket.on("error", () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
      socket.destroy();
    });

    socket.connect(port, host);
  });
}

// Helper to send Unconnected Ping over UDP (for Bedrock players on 19136)
function pingBedrockUdp(host: string, port: number, timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const client = dgram.createSocket("udp4");
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.close();
        resolve(false);
      }
    }, timeout);

    client.on("message", (msg) => {
      // Unconnected Pong packet ID is 0x1c
      if (msg && msg[0] === 0x1c) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          client.close();
          resolve(true);
        }
      }
    });

    client.on("error", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        client.close();
        resolve(false);
      }
    });

    try {
      // Create Bedrock unconnected ping packet:
      // Packet ID (1 byte) + Timestamp (8 bytes) + Magic (16 bytes) + GUID (8 bytes) = 33 bytes
      const packet = Buffer.alloc(33);
      packet.writeUInt8(0x01, 0); // Unconnected Ping
      packet.writeBigInt64BE(BigInt(Date.now()), 1);
      
      // Magic bytes: 00 ff ff 00 fe fe fe fe 00 fd fd fd 12 34 56 78
      const magicHex = "00ffff00fefefe00fdfdfd12345678";
      Buffer.from(magicHex, "hex").copy(packet, 9);
      packet.writeBigInt64BE(BigInt(0), 25); // Client GUID

      client.send(packet, 0, packet.length, port, host, (err) => {
        if (err && !resolved) {
          resolved = true;
          clearTimeout(timer);
          client.close();
          resolve(false);
        }
      });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        client.close();
        resolve(false);
      }
    }
  });
}

interface PterodactylData {
  online: boolean;
  cpu: number;
  ram: number;
  ramMax: number;
  disk: number;
  diskMax: number;
  state: string;
}

// Fetch real-time resources and limits from Pterodactyl Client API
async function getPterodactylStats(): Promise<PterodactylData | null> {
  const apiKey = process.env.PTERODACTYL_API_KEY;
  const panelUrlRaw = process.env.PTERODACTYL_PANEL_URL;
  const serverId = process.env.PTERODACTYL_SERVER_ID;

  if (!apiKey || !panelUrlRaw || !serverId) {
    return null;
  }

  const panelUrl = panelUrlRaw.replace(/\/$/, "");

  try {
    const [detailsRes, resourcesRes] = await Promise.all([
      fetch(`${panelUrl}/api/client/servers/${serverId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        signal: AbortSignal.timeout(3500)
      }),
      fetch(`${panelUrl}/api/client/servers/${serverId}/resources`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        signal: AbortSignal.timeout(3500)
      })
    ]);

    if (!detailsRes.ok || !resourcesRes.ok) {
      throw new Error(`Pterodactyl fetch failed: details=${detailsRes.status}, resources=${resourcesRes.status}`);
    }

    const details = await detailsRes.json() as any;
    const resources = await resourcesRes.json() as any;

    const current_state = resources.attributes?.current_state || "offline";
    const isOnline = current_state === "running" || current_state === "starting";

    const cpu = resources.attributes?.resources?.cpu_absolute ?? 0;
    
    // Pterodactyl memory limit is in MB, memory usage is in bytes.
    const ramMaxMB = details.attributes?.limits?.memory ?? 3072;
    const ramMaxGiB = parseFloat((ramMaxMB / 1024).toFixed(2));
    const ramBytes = resources.attributes?.resources?.memory_bytes ?? 0;
    const ramGiB = parseFloat((ramBytes / (1024 * 1024 * 1024)).toFixed(2));

    const diskMaxMB = details.attributes?.limits?.disk ?? 10240;
    const diskMaxGB = parseFloat((diskMaxMB / 1024).toFixed(2));
    const diskBytes = resources.attributes?.resources?.disk_bytes ?? 0;
    const diskGB = parseFloat((diskBytes / (1024 * 1024 * 1024)).toFixed(2));

    return {
      online: isOnline,
      cpu: parseFloat(cpu.toFixed(2)),
      ram: ramGiB,
      ramMax: ramMaxGiB,
      disk: diskGB,
      diskMax: diskMaxGB,
      state: current_state
    };
  } catch (error: any) {
    console.error("Error fetching Pterodactyl details or resources:", error.message || error);
    return null;
  }
}

interface LogItem {
  id: string;
  timestamp: string;
  type: "chat" | "join" | "leave" | "death" | "info";
  username?: string;
  message?: string;
}

const logQueue: LogItem[] = [
  { id: "init-1", timestamp: new Date(Date.now() - 300000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "info", message: "Shunshine Server Core v1.20.80 telah diaktifkan." },
  { id: "init-2", timestamp: new Date(Date.now() - 240000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "join", username: "Asep_Slayer" },
  { id: "init-3", timestamp: new Date(Date.now() - 200000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "chat", username: "Asep_Slayer", message: "Halo warga! Ada yang mau mabar?" },
  { id: "init-4", timestamp: new Date(Date.now() - 180000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "join", username: "Pak_RT" },
  { id: "init-5", timestamp: new Date(Date.now() - 160000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "chat", username: "Pak_RT", message: "Selamat pagi semuanya, jaga ketertiban ya." },
  { id: "init-6", timestamp: new Date(Date.now() - 120000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "join", username: "Dewi_Craft" },
  { id: "init-7", timestamp: new Date(Date.now() - 90000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "chat", username: "Dewi_Craft", message: "Pak RT bagi berlian donggg hufft" },
  { id: "init-8", timestamp: new Date(Date.now() - 60000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type: "death", username: "Asep_Slayer", message: "Asep_Slayer gugur meledak terkena Creeper." }
];

function addLog(type: "chat" | "join" | "leave" | "death" | "info", username?: string, message?: string) {
  const newLog: LogItem = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    type,
    username,
    message
  };
  logQueue.push(newLog);
  if (logQueue.length > 50) {
    logQueue.shift();
  }
}

const USERNAMES = [
  "Asep_Slayer", "Budi_Gamer", "Dewi_Craft", "Ujang_Pro", "Siti_Kawaii", 
  "Adit_Ganteng", "Pak_RT", "Bocil_PVP", "Kucing_Garong", "Rian_Bedrock", "Kaka_Kece"
];

const CHATS = [
  "woi mabar kuuy",
  "siapa yang punya iron sisa? bagi dong",
  "pinjam pickaxe dong please, punyaku hancur",
  "gwe lagi bikin kastil di koordinat 400 -1200, mampir woi",
  "ada yang jual netherite sword?",
  "halo semuanya selamat datang!",
  "servernya lancar bgt gila no lag",
  "ada creeper di dekat rumah pak RT woi! tolonggg",
  "tps-nya stabil bgt mantap abis",
  "permisi kak, mau tanya cara klaim tanah gimana ya?",
  "ketik /claim buat klaim tanahmu bro",
  "pantesan ga bisa dihancurin wkwk pinter juga",
  "siapa mau trade berlian sama emas?",
  "gw mau, msh ada ga bro?",
  "malam ini ada event cari harta karun ga ya?"
];

const DEATH_MESSAGES = [
  "gugur saat bertarung melawan Zombie liar.",
  "terbakar oleh lava panas di kedalaman gua.",
  "jatuh dari tempat tinggi karena didorong skeleton panah.",
  "meledak terkena Creeper diam-diam di pertambangan.",
  "mati tenggelam di danau terdalam mencari kelp.",
  "tertusuk taring tajam seekor Sweet Berry Bush saat berlari."
];

const simulatedOnlinePlayers = new Set<string>(["Asep_Slayer", "Pak_RT", "Dewi_Craft"]);

// Set up log generator loop
setInterval(() => {
  const rand = Math.random();
  if (rand < 0.15) {
    // Player Join
    const offlinePlayers = USERNAMES.filter(name => !simulatedOnlinePlayers.has(name));
    if (offlinePlayers.length > 0) {
      const joiningPlayer = offlinePlayers[Math.floor(Math.random() * offlinePlayers.length)];
      simulatedOnlinePlayers.add(joiningPlayer);
      addLog("join", joiningPlayer, `${joiningPlayer} bergabung ke server.`);
    }
  } else if (rand < 0.30) {
    // Player Leave
    if (simulatedOnlinePlayers.size > 2) {
      const onlineList = Array.from(simulatedOnlinePlayers);
      const leavingPlayer = onlineList[Math.floor(Math.random() * onlineList.length)];
      simulatedOnlinePlayers.delete(leavingPlayer);
      addLog("leave", leavingPlayer, `${leavingPlayer} keluar dari server.`);
    }
  } else if (rand < 0.70) {
    // Chat Message
    if (simulatedOnlinePlayers.size > 0) {
      const onlineList = Array.from(simulatedOnlinePlayers);
      const speaker = onlineList[Math.floor(Math.random() * onlineList.length)];
      const msg = CHATS[Math.floor(Math.random() * CHATS.length)];
      addLog("chat", speaker, msg);
    }
  } else if (rand < 0.85) {
    // Player Death
    if (simulatedOnlinePlayers.size > 0) {
      const onlineList = Array.from(simulatedOnlinePlayers);
      const victim = onlineList[Math.floor(Math.random() * onlineList.length)];
      const deathMsg = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
      addLog("death", victim, `${victim} ${deathMsg}`);
    }
  } else {
    // Info Tips Announcement
    const announcements = [
      "Maksimal kapasitas server adalah 50 slot warga secara simultan.",
      "Gunakan perintah /claim untuk mengamankan lahan, peti, dan bangunan berhargamu.",
      "Ingin bergabung ke grup WhatsApp atau server Discord? Klik tombol di bagian atas web!",
      "Restart server terjadwal setiap malam jam 12 untuk menjaga performa tps tetap 20.0.",
      "Bila ada kendala atau lag berlebihan, harap laporkan langsung kepada Pak RT atau Admin."
    ];
    const infoMsg = announcements[Math.floor(Math.random() * announcements.length)];
    addLog("info", undefined, infoMsg);
  }
}, 8000); // simulation interval

// In production, we'll serve the static files in /dist
// In development, we'll use Vite dev server as middleware

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const PREFERRED_HOST = "play.shunshine.qzz.io";
  const FALLBACK_HOST = "play.shunshine.qzz.io";

  // API Route: Get Server Status
  app.get("/api/server-status", async (req, res) => {
    // 1. Try to fetch real-time resources and status from Pterodactyl if credentials are set
    const pteroData = await getPterodactylStats();

    // Determine which host is currently online
    let activeHost = PREFERRED_HOST;
    let tcpOnline = false;
    let udpOnline = false;

    if (pteroData) {
      // If Pterodactyl returned valid stats, use its online state directly!
      tcpOnline = pteroData.online;
      udpOnline = pteroData.online;
    } else {
      // Otherwise, check status via direct TCP/UDP ping
      [tcpOnline, udpOnline] = await Promise.all([
        pingMinecraftPort(PREFERRED_HOST, 19136, 1200),
        pingBedrockUdp(PREFERRED_HOST, 19136, 1200)
      ]);

      // If preferred host fails, try fallback host immediately
      if (!tcpOnline && !udpOnline) {
        const [fbTcp, fbUdp] = await Promise.all([
          pingMinecraftPort(FALLBACK_HOST, 19136, 1200),
          pingBedrockUdp(FALLBACK_HOST, 19136, 1200)
        ]);
        if (fbTcp || fbUdp) {
          activeHost = FALLBACK_HOST;
          tcpOnline = fbTcp;
          udpOnline = fbUdp;
        }
      }
    }

    const isCurrentlyOnline = pteroData ? pteroData.online : (tcpOnline || udpOnline);

    // If direct checks / Pterodactyl show the server is offline, trust them 100% and bypass cache immediately!
    if (!isCurrentlyOnline) {
      return res.json({
        online: false,
        currentPlayers: 0,
        maxPlayers: 50, // Default configured max players
        onlinePlayers: [],
        host: PREFERRED_HOST,
        realtime: true,
        ptero: pteroData
      });
    }

    try {
      // Fetch status from Minecraft server status API to get player counts, list of players, and max capacity
      const response = await fetch(`https://api.mcsrvstat.us/3/${activeHost}`);
      if (!response.ok) {
        throw new Error(`Public API returned status ${response.status}`);
      }
      const data = await response.json();
      
      res.json({
        online: true, // We verified it's online via direct ping or Pterodactyl
        currentPlayers: data.players?.online ?? 0,
        maxPlayers: data.players?.max ?? 50, // Default to 50 as set by user
        onlinePlayers: data.players?.list?.map((p: any) => typeof p === 'string' ? p : p.name) ?? [],
        host: PREFERRED_HOST,
        realtime: true,
        ptero: pteroData
      });
    } catch (error: any) {
      console.error("Gagal mendapatkan status lengkap dari mcsrvstat:", error.message || error);
      
      // Fallback to minetools if mcsrvstat is down or rate-limited
      try {
        const altResponse = await fetch(`https://api.minetools.eu/ping/${activeHost}/19136`);
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (!altData.error) {
            res.json({
              online: true,
              currentPlayers: altData.players?.online ?? 0,
              maxPlayers: altData.players?.max ?? 50,
              onlinePlayers: [],
              host: PREFERRED_HOST,
              realtime: true,
              ptero: pteroData
            });
            return;
          }
        }
      } catch (altError) {
        // Ignore alt error
      }

      // If both public APIs failed but our direct ping was successful, report as online with generic stats
      res.json({
        online: true,
        currentPlayers: 0,
        maxPlayers: 50,
        onlinePlayers: [],
        host: PREFERRED_HOST,
        realtime: true,
        ptero: pteroData,
        warning: "API statistik penuh sedang bermasalah, namun koneksi server aktif."
      });
    }
  });

  // API Route: Get simulated/real player event & chat logs
  app.get("/api/server-logs", (req, res) => {
    res.json({ logs: logQueue });
  });

  // API Route: Post chat message to the server console from visitors
  app.post("/api/send-chat", (req, res) => {
    const { username, message } = req.body;
    if (!username || !message || typeof username !== "string" || typeof message !== "string") {
      return res.status(400).json({ error: "Username dan pesan tidak valid." });
    }

    const cleanUsername = username.trim().substring(0, 16) || "Visitor";
    const cleanMessage = message.trim().substring(0, 100);

    if (!cleanMessage) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    // Add to the live queue
    addLog("chat", cleanUsername, cleanMessage);

    // Dynamic, lively reply from random online Minecraft players to keep the chat fun and active!
    setTimeout(() => {
      const onlineList = Array.from(simulatedOnlinePlayers);
      if (onlineList.length > 0) {
        const replier = onlineList[Math.floor(Math.random() * onlineList.length)];
        const replies = [
          `wkwkwk halo ${cleanUsername}! salam kenal`,
          `eh ada ${cleanUsername} mampir di web!`,
          `yoo ${cleanUsername}, ayo masuk server dapet starterpack!`,
          `halo ${cleanUsername}, lagi liat web ya?`,
          "yooo",
          "gwe lagi mining nih, banyak iron",
          "mantap kali mampir di mari bang!"
        ];
        const replyMsg = replies[Math.floor(Math.random() * replies.length)];
        addLog("chat", replier, replyMsg);
      }
    }, 1500 + Math.random() * 1500);

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Express + Vite berjalan di http://localhost:${PORT}`);
  });
}

startServer();
