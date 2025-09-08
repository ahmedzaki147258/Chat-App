import express from "express";
import { authenticateAccessToken, handleImageUpload } from "src/middlewares";
import { getConversationsWithLastMessage, getUsers, updateUser, updateUserImage } from "src/controllers/user.controller";

const router: express.Router = express.Router();

router.get("/", authenticateAccessToken, getUsers);
router.get("/conversations", authenticateAccessToken, getConversationsWithLastMessage);
router.patch("/", authenticateAccessToken, updateUser);
router.patch("/image", authenticateAccessToken, handleImageUpload("user"), updateUserImage);

export default router;