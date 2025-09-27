import express from "express";
import { authenticateAccessToken, handleImageUpload } from "src/middlewares";
import { 
  getConversationsWithLastMessage, 
  getMessagesByConversationId, 
  uploadImage,
  editMessage,
  deleteMessage,
  markMessageAsRead
} from "src/controllers/chat.controller";

const router: express.Router = express.Router();

// Conversation routes
router.get("/", authenticateAccessToken, getConversationsWithLastMessage);
router.get("/:id/messages", authenticateAccessToken, getMessagesByConversationId);

// Message operations
router.put("/messages/:messageId", authenticateAccessToken, editMessage);
router.delete("/messages/:messageId", authenticateAccessToken, deleteMessage);
router.post("/messages/:messageId/read", authenticateAccessToken, markMessageAsRead);

// File upload
router.post("/uploadImage", authenticateAccessToken, handleImageUpload("message"), uploadImage);

export default router;