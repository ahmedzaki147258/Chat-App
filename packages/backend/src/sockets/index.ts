import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "src/middlewares/socket.middleware";
import { addUserSocket, getAllSockets, removeUserSocket } from "./socketUserMap";
import chatSocket from "./chat.socket";
import { User } from "src/db";

export default function initSocket(io: Server) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("New client connected", socket.id);
    if (socket.user?.id) addUserSocket(socket.user?.id, socket.id);
    console.log("socketUser:", getAllSockets());

    // register chat events
    chatSocket(io, socket);

    socket.on("disconnect", async () => {
      console.log("Client disconnected", socket.id);
      if (socket.user?.id) {
        await User.update(
          { isOnline: false, lastSeen: new Date() },
          { where: { id: socket.user?.id } }
        );
        removeUserSocket(socket.user?.id);
      }
      console.log('deleted:', getAllSockets());
    });
  });
}