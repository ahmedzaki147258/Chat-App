import jwt from "jsonwebtoken";
import { ReqUser } from "@/shared/types/user";

const ACCESS_SECRET: string = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): ReqUser => {
  return jwt.verify(token, ACCESS_SECRET) as ReqUser;
};

export const verifyRefreshToken = (token: string): ReqUser => {
  return jwt.verify(token, REFRESH_SECRET) as ReqUser;
};
