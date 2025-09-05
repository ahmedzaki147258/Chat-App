import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { verifyAccessToken } from "src/utils/jwt";
import { NextFunction, Request, Response } from "express";

export const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Access token required" });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Token expired" });
    }

    if (error instanceof Error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Unknown error" });
  }
};

export default authenticateAccessToken;