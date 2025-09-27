import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { verifyAccessToken } from "src/utils/jwt";
import { User } from "src/db";

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookies = socket.handshake.headers.cookie
      ? parse(socket.handshake.headers.cookie)
      : {};

    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    // If no access token but has refresh token, suggest retry
    if (!accessToken && refreshToken) {
      return next(new Error("Access token missing - retry in a moment"));
    }

    // If no tokens at all
    if (!accessToken) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload || typeof payload !== "object" || !payload.id) {
      return next(new Error("Invalid access token"));
    }

    // Get user details from database
    const user = await User.findByPk(payload.id);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = { 
      id: user.id, 
      name: user.name, 
      email: user.email 
    };
    
    console.log(`Socket authenticated for user: ${user.name} (${user.id})`);
    next();
  } catch (err: unknown) {
    console.error('Socket auth error:', err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new Error("Invalid token format"));
    }

    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("Access token expired"));
    }

    if (err instanceof Error) {
      return next(new Error(`Auth error: ${err.message}`));
    }

    return next(new Error("Authentication failed"));
  }
};