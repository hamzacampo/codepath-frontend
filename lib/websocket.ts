/**
 * WebSocket client for real-time features (live scoreboard, contest updates)
 */

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./auth";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

let socket: Socket | null = null;

/**
 * Initialize WebSocket connection
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = getAccessToken();

  socket = io(WS_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");
  });

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect WebSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to contest updates
 */
export function subscribeToContest(contestId: string, callback: (data: any) => void): void {
  const sock = getSocket();
  if (sock) {
    sock.emit("join-contest", contestId);
    sock.on(`contest-${contestId}`, callback);
  }
}

/**
 * Unsubscribe from contest updates
 */
export function unsubscribeFromContest(contestId: string): void {
  const sock = getSocket();
  if (sock) {
    sock.emit("leave-contest", contestId);
    sock.off(`contest-${contestId}`);
  }
}

