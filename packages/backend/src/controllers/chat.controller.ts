import httpStatus from "http-status";
import { literal, Op } from "sequelize";
import { Request, Response } from "express";
import { Conversation, User, Message } from "src/db";

export const getConversationsWithLastMessage = async (req: Request, res: Response) => {
  const userId: number = req.user?.id!;
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { userOneId: userId },
          { userTwoId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: "userOne",
        },
        {
          model: User,
          as: "userTwo",
        },
        {
          model: Message,
          as: "messages",
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]]
        }
      ],
      order: [
        [literal('(SELECT MAX(createdAt) FROM messages WHERE messages.conversationId = Conversation.id)'), 'DESC']
      ]
    });
    res.status(httpStatus.OK).json({ status: "success", data: conversations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const getMessagesByConversationId = async (req: Request, res: Response) => {
  const conversationId: number = +req.params.id;
  try {
    const messages = await Message.findAll({
      where: {
        conversationId
      },
      order: [
        ["createdAt", "ASC"]
      ]
    });
    res.status(httpStatus.OK).json({ status: "success", data: messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const uploadImage = (req: Request, res: Response) => {
  try {
    res.status(httpStatus.OK).json({ status: "success", data: req.file?.path });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};