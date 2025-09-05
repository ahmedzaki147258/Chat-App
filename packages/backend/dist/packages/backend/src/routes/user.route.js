"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("src/controllers/user.controller");
const middlewares_1 = require("src/middlewares");
const authenticate_middleware_1 = __importDefault(require("src/middlewares/authenticate.middleware"));
const router = express_1.default.Router();
router.get("/", user_controller_1.getUsers);
router.get("/conversations", authenticate_middleware_1.default, user_controller_1.getConversationsWithLastMessage);
router.patch("/image", authenticate_middleware_1.default, (0, middlewares_1.handleImageUpload)("user"), user_controller_1.updateUserImage);
exports.default = router;
