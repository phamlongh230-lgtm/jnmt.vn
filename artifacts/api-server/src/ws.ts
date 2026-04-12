import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./lib/logger";

const rooms = new Map<string, Set<WebSocket>>();

export function createWsServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/room" });

  wss.on("connection", (ws, req) => {
    const url = req.url || "";
    const parts = url.split("/");
    const roomId = parts[parts.length - 1];

    if (!roomId) {
      ws.close(1008, "Room ID required");
      return;
    }

    logger.info({ roomId }, "WebSocket client joined room");

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(ws);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const roomClients = rooms.get(roomId);
        if (roomClients) {
          for (const client of roomClients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          }
        }
      } catch {
        logger.warn("Invalid WebSocket message");
      }
    });

    ws.on("close", () => {
      const roomClients = rooms.get(roomId);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(roomId);
        }
      }
      logger.info({ roomId }, "WebSocket client left room");
    });

    ws.on("error", (err) => {
      logger.error({ err, roomId }, "WebSocket error");
    });
  });

  logger.info("WebSocket server created");
}
