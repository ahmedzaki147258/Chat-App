import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { verifyAccessToken } from "src/utils/jwt";

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookies = socket.handshake.headers.cookie
      ? parse(socket.handshake.headers.cookie)
      : {};

    const token = cookies.accessToken;
    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }

    const user = verifyAccessToken(token);
    if (!user || typeof user !== "object" || !user.id) {
      return next(new Error("Invalid token"));
    }

    socket.user = { id: user.id };
    next();
  } catch (err: unknown) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error("Invalid token"));
    }

    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Token expired"));
    }

    if (err instanceof Error) {
      return next(new Error(err.message));
    }

    return next(new Error("Unknown error"));
  }
};