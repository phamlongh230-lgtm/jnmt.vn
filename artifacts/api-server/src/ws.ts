import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./lib/logger";

const rooms = new Map<string, Set<WebSocket>>();
const onlineUsers = new Map<WebSocket, { roomId: string; username: string | null }>();

/** Push a message to every connected client in a room (called from REST routes). */
export function broadcast(roomId: string, data: unknown) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;
  const payload = JSON.stringify(data);
  for (const client of roomClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

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
    onlineUsers.set(ws, { roomId, username: null });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Handle join: register username for online tracking
        if (msg.type === "join" && typeof msg.username === "string") {
          onlineUsers.set(ws, { roomId, username: msg.username });
          broadcastOnline(roomId);
          return;
        }

        // Relay client→client messages (typing events, etc.) to all OTHER clients
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
        if (roomClients.size === 0) rooms.delete(roomId);
      }
      onlineUsers.delete(ws);
      broadcastOnline(roomId);
      logger.info({ roomId }, "WebSocket client left room");
    });

    ws.on("error", (err) => {
      logger.error({ err, roomId }, "WebSocket error");
    });
  });

  logger.info("WebSocket server created");
}

function broadcastOnline(roomId: string) {
  const users: string[] = [];
  for (const [, info] of onlineUsers) {
    if (info.roomId === roomId && info.username) users.push(info.username);
  }
  broadcast(roomId, { type: "online_users", users: [...new Set(users)] });
}
