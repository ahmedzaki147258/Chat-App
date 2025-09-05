"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.logoutUser = exports.registerUser = exports.loginUser = void 0;
const db_1 = require("src/db");
const http_status_1 = __importDefault(require("http-status"));
const jwt_1 = require("src/utils/jwt");
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.User.unscoped().findOne({ where: { email } });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Invalid email or password" });
        }
        const payload = { id: user.id, email: user.email };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
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
        res.status(http_status_1.default.OK).json({ status: "success", data: user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
        }
    }
};
exports.loginUser = loginUser;
const registerUser = async (req, res) => {
    try {
        const user = await db_1.User.create(req.body);
        res.status(http_status_1.default.CREATED).json({ status: "success", data: user.toJSON() });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
        }
    }
};
exports.registerUser = registerUser;
const logoutUser = async (req, res) => {
    const userId = +req.params.id;
    try {
        await db_1.User.update({ refreshToken: null }, { where: { id: userId } });
        res.status(http_status_1.default.OK).json({ message: "Logged out successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
        }
    }
};
exports.logoutUser = logoutUser;
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Refresh token required" });
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        const user = await db_1.User.findByPk(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(http_status_1.default.FORBIDDEN).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)({ id: user.id, email: user.email });
        res.status(http_status_1.default.OK).json({ status: "success", accessToken: newAccessToken });
    }
    catch (error) {
        res.status(http_status_1.default.FORBIDDEN).json({ message: "Invalid or expired refresh token" });
    }
};
exports.refreshToken = refreshToken;
