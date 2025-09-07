import { User } from "src/db";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { sendAuthTokens } from "src/utils/auth";
import { generateAccessToken, verifyRefreshToken } from "src/utils/jwt";

export const loginUser = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const user: User | null = await User.unscoped().findOne({ where: { email } });
		if (!user || !(await user.validatePassword(password))) {
			return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid email or password" });
		}

		await sendAuthTokens(res, user);
    res.status(httpStatus.OK).json({ status: "success", data: user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};

export const registerUser = async (req: Request, res: Response) => {
	try {
		const user = await User.create(req.body);
    res.status(httpStatus.CREATED).json({ status: "success", data: user.toJSON() });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Not logged in" });
		const userId: number = req.user.id;
		await User.update({ refreshToken: null }, { where: { id: userId }});
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.status(httpStatus.OK).json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Refresh token required" });

    const decoded = verifyRefreshToken(token);
    const user = await User.unscoped().findByPk(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(httpStatus.FORBIDDEN).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email });
		res.cookie("accessToken", newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000, // 15 minutes
		});
		res.status(httpStatus.OK).json({ status: "success" });
  } catch (error) {
    res.status(httpStatus.FORBIDDEN).json({ message: "Invalid or expired refresh token" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (req.user) {
    const user = await User.findByPk(req.user.id);
    res.status(httpStatus.OK).json({ user });
  } else {
    res.status(httpStatus.UNAUTHORIZED).json({ user: null });
  }
};

/* ======================================== Google OAuth ======================================== */
export const googleCallback = async (req: Request, res: Response) => {
  const CLIENT_WEBSITE_URL = process.env.CLIENT_URL!;
  if (!req.user) {
    return res.redirect(`${CLIENT_WEBSITE_URL}/login?error=google-auth-failed`);
  }

  const user = req.user as User; // Passport returns the user
  await sendAuthTokens(res, user);
  res.redirect(CLIENT_WEBSITE_URL);
};

export const googleFailure = (req: Request, res: Response) => {
  const CLIENT_WEBSITE_URL = process.env.CLIENT_URL;
  res.redirect(`${CLIENT_WEBSITE_URL}`);
};