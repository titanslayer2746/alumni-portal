import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  chatService,
  type Conversation,
  type Message,
} from "../services/chatService";
import { websocketService } from "../services/websocketService";

interface ChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, type?: "text" | "system") => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (
    participantIds: string[],
    jobId?: string,
    applicationId?: string
  ) => Promise<Conversation>;
  closeConversation: (conversationId: string) => Promise<void>;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token");
      if (token) {
        websocketService
          .connect(token)
          .then(() => {
            setIsConnected(true);
            console.log("WebSocket connected successfully");
          })
          .catch((error) => {
            console.error("Failed to connect WebSocket:", error);
            setIsConnected(false);
          });
      }
    } else {
      websocketService.disconnect();
      setIsConnected(false);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Set up WebSocket event listeners
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message: Message = event.detail;

      // Add message to current conversation if it matches
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Update conversation list with new message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              }
            : conv
        )
      );
    };

    const handleConversationUpdate = (event: CustomEvent) => {
      const conversation: Conversation = event.detail;
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversation.id ? conversation : conv))
      );
    };

    const handleError = (event: CustomEvent) => {
      const error: string = event.detail;
      setError(error);
    };

    websocketService.addEventListener(
      "websocket:message",
      handleMessage as EventListener
    );
    websocketService.addEventListener(
      "websocket:conversationUpdate",
      handleConversationUpdate as EventListener
    );
    websocketService.addEventListener(
      "websocket:error",
      handleError as EventListener
    );

    return () => {
      websocketService.removeEventListener(
        "websocket:message",
        handleMessage as EventListener
      );
      websocketService.removeEventListener(
        "websocket:conversationUpdate",
        handleConversationUpdate as EventListener
      );
      websocketService.removeEventListener(
        "websocket:error",
        handleError as EventListener
      );
    };
  }, [activeConversation]);

  // Load conversations when chat is opened
  useEffect(() => {
    if (isChatOpen && isAuthenticated) {
      loadConversations();
    }
  }, [isChatOpen, isAuthenticated]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    setActiveConversation(null);
    setMessages([]);
  };

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatService.getUserConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load conversations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatService.getConversationMessages(
        conversationId
      );
      setMessages(response.messages);

      // Join WebSocket room for this conversation
      websocketService.joinConversation(conversationId);
    } catch (error) {
      console.error("Error loading messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, type: "text" | "system" = "text") => {
      console.log("ChatContext sendMessage called", {
        content,
        type,
        activeConversation: activeConversation?.id,
        isConnected,
      });

      if (!activeConversation) {
        console.error("No active conversation");
        throw new Error("No active conversation");
      }

      try {
        console.log("Sending via WebSocket...");
        // Send via WebSocket for real-time delivery
        websocketService.sendMessage(activeConversation.id, content, type);

        console.log("Sending via HTTP...");
        // Also send via HTTP as fallback
        const result = await chatService.sendMessage(activeConversation.id, {
          content,
          type,
        });
        console.log("HTTP send result:", result);
      } catch (error) {
        console.error("Error sending message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
        throw error;
      }
    },
    [activeConversation, isConnected]
  );

  const createConversation = useCallback(
    async (
      participantIds: string[],
      jobId?: string,
      applicationId?: string
    ) => {
      try {
        const conversation = await chatService.createConversation({
          participantIds,
          jobId,
          applicationId,
        });

        // Add to conversations list
        setConversations((prev) => [conversation, ...prev]);

        return conversation;
      } catch (error) {
        console.error("Error creating conversation:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to create conversation"
        );
        throw error;
      }
    },
    []
  );

  const closeConversation = useCallback(
    async (conversationId: string) => {
      try {
        await chatService.closeConversation(conversationId);

        // Update conversation status
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, status: "closed" as const }
              : conv
          )
        );

        // If this was the active conversation, clear it
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error closing conversation:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to close conversation"
        );
        throw error;
      }
    },
    [activeConversation]
  );

  const value = {
    isChatOpen,
    openChat,
    closeChat,
    conversations,
    activeConversation,
    messages,
    isLoading,
    error,
    setActiveConversation,
    sendMessage,
    loadConversations,
    loadMessages,
    createConversation,
    closeConversation,
    isConnected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
