import express from "express";
import { authenticateAccessToken, handleImageUpload } from "src/middlewares";
import { getConversationsWithLastMessage, getUsers, updateUserImage } from "src/controllers/user.controller";

const router: express.Router = express.Router();

router.get("/", authenticateAccessToken, getUsers);
router.get("/conversations", authenticateAccessToken, getConversationsWithLastMessage);
router.patch("/image", authenticateAccessToken, handleImageUpload("user"), updateUserImage);

export default router;