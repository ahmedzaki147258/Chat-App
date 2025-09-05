"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = exports.authRoutes = void 0;
const auth_route_1 = __importDefault(require("./auth.route"));
exports.authRoutes = auth_route_1.default;
const user_route_1 = __importDefault(require("./user.route"));
exports.userRoutes = user_route_1.default;
