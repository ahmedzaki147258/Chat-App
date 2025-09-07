import { Response } from "express";
import { User } from "src/db";
import { generateAccessToken, generateRefreshToken } from "./jwt";

export const sendAuthTokens = async (res: Response, user: User) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  await user.update({ refreshToken });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken, refreshToken };
};
