import express from "express";
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  closeConversation,
  createConversationFromShortlist,
  getConversationById,
  getUsersForConversation,
} from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// User routes for conversation initiation
router.get("/users", getUsersForConversation);

// Conversation routes
router.post("/conversations", createConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:conversationId", getConversationById);
router.put("/conversations/:conversationId/close", closeConversation);

// Message routes
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

// Special route for creating conversation from shortlisting
router.post(
  "/conversations/initiate-from-shortlist",
  createConversationFromShortlist
);

export default router;
