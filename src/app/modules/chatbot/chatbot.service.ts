// Simple in-memory conversation storage (for demo; use DB in production)
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedIdeas?: string[];
  actionType?: string;
}

interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

// In-memory storage
const conversations = new Map<string, Conversation>();

export const chatbotService = {
  async sendMessage(userId: string, message: string, conversationId?: string) {
    const finalConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation
    let conversation = conversations.get(finalConversationId);
    if (!conversation) {
      conversation = {
        id: finalConversationId,
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversations.set(finalConversationId, conversation);
    } else {
      // Security: Validate that the conversation belongs to the current user
      if (conversation.userId !== userId) {
        throw new Error("Unauthorized: This conversation does not belong to you");
      }
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Generate AI response based on message content
    const aiResponse = await this.generateAIResponse(userId, message);

    // Add assistant message
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: "assistant",
      content: aiResponse.content,
      timestamp: new Date(),
      suggestedIdeas: aiResponse.suggestedIdeas,
      actionType: aiResponse.actionType,
    };
    conversation.messages.push(assistantMessage);

    conversation.updatedAt = new Date();

    return {
      conversationId: finalConversationId,
      message: assistantMessage,
      conversationTitle: conversation.title || "New Conversation",
    };
  },

  async generateAIResponse(userId: string, userMessage: string) {
    // Simple AI response logic - can be enhanced with actual AI/LLM API
    const lowerMessage = userMessage.toLowerCase();

    // Detect intent
    let response: string;
    let actionType: string | undefined;
    let suggestedIdeas: string[] = [];

    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      response =
        "I'm here to help you explore sustainable ideas! You can ask me about:\n\n• **Finding ideas** - I can suggest ideas based on your interests\n• **Sustainability topics** - Ask about climate, renewable energy, waste reduction, etc.\n• **Idea creation** - Get tips on creating and sharing your own sustainable ideas\n• **Community** - Learn about our community and how to participate\n\nWhat would you like to know more about?";
      actionType = "help";
    } else if (lowerMessage.includes("idea") || lowerMessage.includes("suggest")) {
      response =
        "Great! I'd love to help you find sustainable ideas. Are you interested in:\n\n• 🌱 Agriculture & Food Systems\n• ♻️ Waste Reduction & Recycling\n• ⚡ Renewable Energy\n• 💧 Water Conservation\n• 🌍 Climate Action\n• 🏘️ Sustainable Communities\n\nLet me know which category interests you, and I'll find the best ideas for you!";
      actionType = "suggest_ideas";
      // In production, fetch actual ideas from DB
      suggestedIdeas = ["idea_1", "idea_2", "idea_3"];
    } else if (lowerMessage.includes("create") || lowerMessage.includes("share")) {
      response =
        "That's awesome that you want to share your sustainable idea! Here's what you need to do:\n\n1. **Log in** to your account (or sign up)\n2. Go to **Create Idea** in your dashboard\n3. Fill in:\n   - Title (clear and catchy)\n   - Problem Statement (what problem does it solve?)\n   - Solution (how does your idea solve it?)\n   - Description (add details)\n   - Category (choose the best fit)\n   - Upload an image\n4. Submit for review\n\nOur team will review it and get back to you soon! 🚀";
      actionType = "create_idea";
    } else if (lowerMessage.includes("trending") || lowerMessage.includes("popular")) {
      response =
        "Our **Trending Ideas** section showcases the most upvoted and discussed sustainable ideas on our platform. These ideas represent what our community finds most valuable.\n\nYou can:\n• Vote on ideas you support\n• Leave comments and feedback\n• Save ideas to favorites\n• Purchase premium ideas for detailed insights\n\nWant me to show you the trending ideas? 📈";
      actionType = "view_trending";
      suggestedIdeas = ["trending_1", "trending_2"];
    } else if (lowerMessage.includes("sustainability") || lowerMessage.includes("sustainable")) {
      response =
        "**Sustainability** is about meeting our needs today without compromising the ability of future generations to meet theirs. On our platform, we focus on:\n\n• **Environmental** - Climate action, conservation, clean energy\n• **Social** - Fair practices, community well-being, education\n• **Economic** - Responsible growth, green jobs, circular economy\n\nEvery idea shared here contributes to building a more sustainable future. Would you like to explore ideas in any specific area? 🌿";
    } else if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      response =
        "You're welcome! 😊 Feel free to ask me anything else about our platform or sustainable ideas. I'm here to help!\n\nIs there anything else you'd like to know?";
    } else {
      response =
        "That's an interesting question! 🤔\n\nI can help you with:\n• Finding sustainable ideas\n• Creating and sharing your own ideas\n• Learning about sustainability topics\n• Navigating our platform\n\nCould you be more specific about what you're looking for?";
    }

    return {
      content: response,
      actionType,
      suggestedIdeas,
    };
  },

  async getChatHistory(userId: string, limit: number = 50) {
    const userConversations = Array.from(conversations.values())
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userConversations;
  },

  async getConversation(conversationId: string, userId: string) {
    const conversation = conversations.get(conversationId);

    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    return conversation;
  },

  async clearChatHistory(userId: string) {
    const keysToDelete: string[] = [];

    for (const [key, conv] of conversations.entries()) {
      if (conv.userId === userId) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => conversations.delete(key));

    return { deletedCount: keysToDelete.length };
  },

  async saveConversation(conversationId: string, userId: string, title: string) {
    const conversation = conversations.get(conversationId);

    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    conversation.title = title;
    conversation.updatedAt = new Date();

    return conversation;
  },
};
