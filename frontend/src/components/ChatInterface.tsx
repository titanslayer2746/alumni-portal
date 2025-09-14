import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  MoreVertical,
  Search,
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { websocketService } from "../services/websocketService";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onClose,
  isEmbedded = false,
}) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isConnected,
    setActiveConversation,
    sendMessage,
    loadMessages,
    closeConversation,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set up typing indicator listeners
  useEffect(() => {
    const handleUserTyping = (event: CustomEvent) => {
      const { userId, userName, isTyping } = event.detail;
      setTypingUsers((prev) => {
        if (isTyping) {
          return { ...prev, [userId]: userName };
        } else {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[userId];
          return newTypingUsers;
        }
      });
    };

    websocketService.addEventListener(
      "websocket:userTyping",
      handleUserTyping as EventListener
    );

    return () => {
      websocketService.removeEventListener(
        "websocket:userTyping",
        handleUserTyping as EventListener
      );
    };
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    console.log("handleSendMessage called", {
      newMessage: newMessage.trim(),
      activeConversation: activeConversation?.id,
      isConnected,
      user: user?.id,
      userRole: user?.role,
    });

    if (newMessage.trim() && activeConversation) {
      try {
        console.log("Attempting to send message:", newMessage.trim());
        await sendMessage(newMessage.trim());
        console.log("Message sent successfully");
        setNewMessage("");
        setIsTyping(false);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    } else {
      console.log("Cannot send message - missing requirements:", {
        hasMessage: !!newMessage.trim(),
        hasActiveConversation: !!activeConversation,
      });
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (activeConversation) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        websocketService.sendTyping(activeConversation.id, true);
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false);
        websocketService.sendTyping(activeConversation.id, false);
      }
    }
  };

  const handleConversationSelect = async (conversation: any) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleCloseConversation = async () => {
    if (activeConversation && user?.role === "alumni") {
      try {
        await closeConversation(activeConversation.id);
        setActiveConversation(null);
      } catch (error) {
        console.error("Failed to close conversation:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatTime(date);
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== user?.id);
    return otherParticipant?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id);
  };

  const canCloseConversation = () => {
    return user?.role === "alumni" || user?.role === "admin";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={
            isEmbedded
              ? "h-full flex flex-col"
              : "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isEmbedded ? undefined : onClose}
        >
          <motion.div
            className={
              isEmbedded
                ? "h-full flex flex-col"
                : "glass-card w-full max-w-4xl h-[80vh] flex"
            }
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar - Conversations List (only show in modal mode) */}
            {!isEmbedded && (
              <div className="w-1/3 border-r border-white/10 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">
                        Messages
                      </h2>
                      {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    {!isEmbedded && (
                      <motion.button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-400 text-sm">
                        {searchTerm
                          ? "No conversations found"
                          : "No conversations yet"}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherParticipant =
                        getOtherParticipant(conversation);
                      return (
                        <motion.div
                          key={conversation.id}
                          className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                            activeConversation?.id === conversation.id
                              ? "bg-white/10"
                              : "hover:bg-white/5"
                          }`}
                          onClick={() => handleConversationSelect(conversation)}
                          whileHover={{
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {otherParticipant?.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium truncate">
                                  {otherParticipant?.name || "Unknown User"}
                                </h3>
                                <span className="text-xs text-gray-400">
                                  {formatDate(
                                    new Date(conversation.lastMessageAt)
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 truncate">
                                {conversation.lastMessage?.content ||
                                  "No messages yet"}
                              </p>
                              {conversation.jobId && (
                                <p className="text-xs text-pink-400 truncate">
                                  {conversation.jobId.role} at{" "}
                                  {conversation.jobId.company}
                                </p>
                              )}
                            </div>
                            {conversation.status === "closed" && (
                              <div
                                className="w-2 h-2 bg-gray-500 rounded-full"
                                title="Closed"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getOtherParticipant(activeConversation)?.name?.charAt(
                          0
                        ) || "?"}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {getOtherParticipant(activeConversation)?.name ||
                            "Unknown User"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {activeConversation.jobId
                            ? `${activeConversation.jobId.role} at ${activeConversation.jobId.company}`
                            : "Direct Message"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canCloseConversation() && (
                        <motion.button
                          onClick={handleCloseConversation}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Close Conversation"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-400 text-sm">No messages yet</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Start the conversation!
                        </p>
                      </div>
                    ) : (
                      messages
                        .filter((message) => {
                          if (!message || !message.id) {
                            console.warn("Invalid message object:", message);
                            return false;
                          }
                          return true;
                        })
                        .map((message) => {
                          const isOwn = message.sender?.id === user?.id;
                          return (
                            <motion.div
                              key={message.id}
                              className={`flex ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.type === "system"
                                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                    : isOwn
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/10 text-white"
                                }`}
                              >
                                {message.type === "system" && (
                                  <p className="text-xs font-medium mb-1">
                                    System Message
                                  </p>
                                )}
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTime(new Date(message.createdAt))}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })
                    )}

                    {/* Typing indicators */}
                    {Object.keys(typingUsers).length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 text-white px-4 py-2 rounded-lg">
                          <p className="text-sm text-gray-300">
                            {Object.values(typingUsers).join(", ")}{" "}
                            {Object.keys(typingUsers).length === 1
                              ? "is"
                              : "are"}{" "}
                            typing...
                          </p>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    {activeConversation.status === "closed" ? (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">
                          This conversation has been closed
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                          />
                        </div>
                        <motion.button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-400">
                      Choose a conversation from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatInterface;
