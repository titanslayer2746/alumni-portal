import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import ChatInterface from "../components/ChatInterface";

const Chat: React.FC = () => {
  const { user } = useAuth();
  const {
    isChatOpen,
    closeChat,
    conversations,
    loadConversations,
    isLoading,
    error,
    activeConversation,
    setActiveConversation,
    loadMessages,
  } = useChat();
  const [searchTerm, setSearchTerm] = useState("");

  // Load conversations when component mounts
  useEffect(() => {
    if (
      user &&
      (user.role === "admin" ||
        user.role === "alumni" ||
        user.role === "student")
    ) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id);
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const handleConversationClick = async (conversation: any) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  };

  return (
    <div className="h-[calc(100vh-12rem)] overflow-hidden mt-8 mb-8 mx-16 sm:mx-24 md:mx-32 lg:mx-40 xl:mx-48">
      <div className="h-full flex glass-card overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white glow-text">
                Messages
              </h2>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-400 text-sm mb-2">
                  Error loading conversations
                </p>
                <p className="text-gray-500 text-xs">{error}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400 text-sm mb-2">
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <motion.div
                    key={conversation.id}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      activeConversation?.id === conversation.id
                        ? "bg-white/10"
                        : ""
                    }`}
                    onClick={() => handleConversationClick(conversation)}
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
                            {formatDate(conversation.lastMessageAt)}
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <ChatInterface
              isOpen={true}
              onClose={() => setActiveConversation(null)}
              isEmbedded={true}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {conversations.length === 0
                    ? "No conversations yet"
                    : "Select a conversation"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {conversations.length === 0
                    ? "You don't have any conversations yet"
                    : "Choose a conversation from the sidebar to start chatting"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface Modal */}
      <ChatInterface isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
};

export default Chat;
