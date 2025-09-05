import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { User } from "src/db";
import { verifyRefreshToken } from "src/utils/jwt";

export const authenticateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.token;
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.unscoped().findByPk(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(httpStatus.FORBIDDEN).json({ message: "Invalid refresh token" });
    }

    if ((decoded as any).exp) {
      const exp = (decoded as any).exp;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = exp - now;
      console.log(`Refresh token will expire in ${secondsLeft} seconds`);
    }
    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(httpStatus.FORBIDDEN).json({ message: "Refresh token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(httpStatus.FORBIDDEN).json({ message: "Invalid refresh token" });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

export default authenticateRefreshToken;
