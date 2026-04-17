import express from "express";


import { chatbotController } from "./chatbot.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";


const router = express.Router();

// Send message (authenticated users)
router.post("/send", checkAuth(Role.MEMBER, Role.ADMIN), chatbotController.sendMessage);

// Get chat history (authenticated users)
router.get("/history", checkAuth(Role.MEMBER, Role.ADMIN), chatbotController.getChatHistory);

// Get specific conversation (authenticated users)
router.get("/conversations/:conversationId", checkAuth(Role.MEMBER, Role.ADMIN), chatbotController.getConversation);

// Save conversation with title (authenticated users)
router.patch("/conversations/:conversationId/save", checkAuth(Role.MEMBER, Role.ADMIN), chatbotController.saveConversation);

// Clear all chat history (authenticated users)
router.delete("/history", checkAuth(Role.MEMBER, Role.ADMIN), chatbotController.clearChatHistory);

export const chatbotRoutes = router;
