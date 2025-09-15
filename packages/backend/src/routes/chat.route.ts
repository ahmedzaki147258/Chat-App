import express from "express";
import { authenticateAccessToken, handleImageUpload } from "src/middlewares";
import { getConversationsWithLastMessage, getMessagesByConversationId, uploadImage } from "src/controllers/chat.controller";

const router: express.Router = express.Router();

router.get("/", authenticateAccessToken, getConversationsWithLastMessage);
router.get("/:id/messages", authenticateAccessToken, getMessagesByConversationId);
router.post("/uploadImage", authenticateAccessToken, handleImageUpload("message"), uploadImage);

export default router;