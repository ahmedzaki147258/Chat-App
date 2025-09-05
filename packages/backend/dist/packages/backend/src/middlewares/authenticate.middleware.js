"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const jwt_1 = require("src/utils/jwt");
// interface AuthenticatedRequest extends Request {
//   user?: JwtPayload;
// }
const authenticateToken = async (req, res, next) => {
    try {
        // const authReq = req as AuthenticatedRequest;
        const token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
        if (!token) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Access token required" });
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || typeof decoded !== 'object' || !decoded.id) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        req.user = { id: 1, email: "dc" };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({ message: "Token expired" });
        }
        if (error instanceof Error) {
            return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Unknown error" });
    }
};
exports.authenticateToken = authenticateToken;
exports.default = exports.authenticateToken;
