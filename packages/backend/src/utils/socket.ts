import { Server } from "socket.io";
import { getUserSocket } from "src/sockets/socketUserMap";

let io: Server | null = null;

export const setSocketServer = (socketServer: Server) => {
  io = socketServer;
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error("Socket server not initialized");
  }
  return io;
};

export const emitToUser = (userId: number, event: string, data: any) => {
  if (!io) return;

  const socketId = getUserSocket(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};
