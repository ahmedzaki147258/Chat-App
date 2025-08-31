import httpStatus from "http-status";
import { User } from "src/db/models/User";
import { Request, Response } from "express";

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