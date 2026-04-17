import { Request, Response } from "express";
import { sendChatMessageValidation } from "./chatbot.validation";
import { chatbotService } from "./chatbot.service";
import { catchAsync } from "../../shared/catchAsync";
import AppError from "../../errorHelpers/AppError";

export const chatbotController = {
  sendMessage: catchAsync(async (req: Request, res: Response) => {
    const payload = sendChatMessageValidation.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401,"User not authenticated");
    }

    const result = await chatbotService.sendMessage(userId, payload.message, payload.conversationId);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: result,
    });
  }),

  getChatHistory: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      throw new AppError(401,"User not authenticated" );
    }

    const conversations = await chatbotService.getChatHistory(userId, limit);

    res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully",
      data: conversations,
    });
  }),

  getConversation: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      throw new AppError(401,"User not authenticated" );
    }

    const conversation = await chatbotService.getConversation(conversationId as string, userId);

    res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  }),

  clearChatHistory: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401,"User not authenticated" );
    }

    const result = await chatbotService.clearChatHistory(userId);

    res.status(200).json({
      success: true,
      message: "Chat history cleared",
      data: result,
    });
  }),

  saveConversation: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!userId) {
      throw new AppError(401,"User not authenticated" );
    }

    if (!title || typeof title !== "string") {
      throw new AppError(400,"Title is required" );
    }

    const result = await chatbotService.saveConversation(conversationId as string, userId, title);

    res.status(200).json({
      success: true,
      message: "Conversation saved successfully",
      data: result,
    });
  }),
};
