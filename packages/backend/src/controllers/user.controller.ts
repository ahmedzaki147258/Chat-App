import { User } from "src/db";
import { Op } from "sequelize";
import httpStatus from "http-status";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const id: number = req.user?.id!;
    const where: any = {
      id: { [Op.ne]: id } // exclude current user from results
    };
    if (req.query.search) {
      Object.assign(where, {
        [Op.or]: [
          { name: { [Op.like]: `%${req.query.search}%` } },
          { email: { [Op.like]: `%${req.query.search}%` } }
        ]
      });
    }

    const users = await User.findAll({ where });
    res.status(httpStatus.OK).json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id: number = req.user?.id!;
    const { name } = req.body;
    await User.update({ name }, { where: { id } });
    const updatedUser = await User.findByPk(id);
    if (!updatedUser) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
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
    const message = error instanceof Error ? error.message : String(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message });
  }
};
