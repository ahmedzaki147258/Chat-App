import { Op } from "sequelize";
import { Server, Socket } from "socket.io";
import { Conversation, Message } from "src/db";
import { getUserSocket } from "./socketUserMap";
import { SendMessagePayload } from "@/shared/types/message";

export default function chatSocket(io: Server, socket: Socket) {
  socket.on("sendMessage", async ({ content, messageType, receiverId }: SendMessagePayload) => {
    if (!socket.user?.id) return;
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { userOneId: socket.user.id, userTwoId: receiverId },
          { userOneId: receiverId, userTwoId: socket.user.id }
        ]
      }
    });
    if (!conversation) {
      conversation = await Conversation.create({ userOneId: socket.user.id, userTwoId: receiverId });
    }

    const message = await Message.create({
      content,
      messageType,
      conversationId: conversation.id,
      senderId: socket.user.id,
    });

    io.to(getUserSocket(receiverId)).emit("newMessage", message);
  });
}
