import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// In production, we'll serve the static files in /dist
// In development, we'll use Vite dev server as middleware

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const SERVER_HOST = "play.shunshine.qzz.io";

  // API Route: Get Server Status
  app.get("/api/server-status", async (req, res) => {
    try {
      // Fetch status from reliable Minecraft server status API
      const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_HOST}`);
      if (!response.ok) {
        throw new Error(`Public API returned status ${response.status}`);
      }
      const data = await response.json();
      
      res.json({
        online: data.online || false,
        currentPlayers: data.players?.online ?? 0,
        maxPlayers: data.players?.max ?? 50, // Default to 50 as set by user
        onlinePlayers: data.players?.list?.map((p: any) => typeof p === 'string' ? p : p.name) ?? [],
        host: SERVER_HOST,
      });
    } catch (error: any) {
      console.error("Gagal mendapatkan status dari mcsrvstat:", error.message || error);
      
      // Fallback to minetools if mcsrvstat is down or rate-limited
      try {
        const altResponse = await fetch(`https://api.minetools.eu/ping/${SERVER_HOST}/19136`);
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (!altData.error) {
            res.json({
              online: true,
              currentPlayers: altData.players?.online ?? 0,
              maxPlayers: altData.players?.max ?? 50,
              onlinePlayers: [],
              host: SERVER_HOST,
            });
            return;
          }
        }
      } catch (altError) {
        // Ignore alt error
      }

      res.json({
        online: false,
        currentPlayers: 0,
        maxPlayers: 50, // Default to 50 as set by user
        onlinePlayers: [],
        error: "Server Minecraft tidak merespon (Offline)",
        host: SERVER_HOST,
      });
    }
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
