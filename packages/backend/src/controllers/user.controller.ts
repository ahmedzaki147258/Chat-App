import { Op } from "sequelize";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { User, Message, Conversation } from "src/db";

export const getUsers = async (req: Request, res: Response) => {
  const filters = {};
  const page = +req.query.page! || 1;
  const limit = +req.query.limit! || 10;
  try {
    const users = await User.findAll();
    res.status(httpStatus.OK).json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};

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
          as: 'userOne',
        },
        {
          model: User,
          as: 'userTwo',
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          separate: true,
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.status(httpStatus.OK).json(conversations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};

export const updateUserImage = async (req: Request, res: Response) => {
  const id: number = req.user?.id!;
  try {
    await User.update({ imageUrl: req.file?.path }, { where: { id } });
    const updatedUser = await User.findByPk(id);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};
