import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MoreVertical, Phone, Video, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  messages: Message[];
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample conversations data
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "Thanks for the job referral!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 2,
      messages: [
        {
          id: "1",
          text: "Hi! I saw your post about the software engineer position at Google. I'm very interested!",
          sender: "Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isOwn: false,
        },
        {
          id: "2",
          text: "Hi Sarah! Great to hear from you. I'd be happy to refer you. Do you have your resume ready?",
          sender: user?.name || "You",
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          isOwn: true,
        },
        {
          id: "3",
          text: "Yes, I do! Should I send it to you directly?",
          sender: "Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          isOwn: false,
        },
        {
          id: "4",
          text: "Thanks for the job referral!",
          sender: "Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isOwn: false,
        },
      ],
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "MC",
      lastMessage: "The interview went well!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      unreadCount: 0,
      messages: [
        {
          id: "5",
          text: "Hey! How did the interview go?",
          sender: user?.name || "You",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isOwn: true,
        },
        {
          id: "6",
          text: "The interview went well! They said they'll get back to me by Friday.",
          sender: "Mike Chen",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          isOwn: false,
        },
      ],
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "Can we schedule a coffee chat?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 1,
      messages: [
        {
          id: "7",
          text: "Hi! I'm a recent graduate and would love to learn more about your career path.",
          sender: "Emily Rodriguez",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
          isOwn: false,
        },
        {
          id: "8",
          text: "Can we schedule a coffee chat?",
          sender: "Emily Rodriguez",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isOwn: false,
        },
      ],
    },
    {
      id: "4",
      name: "David Kim",
      avatar: "DK",
      lastMessage: "The networking event was amazing!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      messages: [
        {
          id: "9",
          text: "Hey! Thanks for inviting me to the tech networking event yesterday.",
          sender: "David Kim",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          isOwn: false,
        },
        {
          id: "10",
          text: "No problem! Did you meet anyone interesting?",
          sender: user?.name || "You",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
          isOwn: true,
        },
        {
          id: "11",
          text: "The networking event was amazing! I connected with 3 potential employers.",
          sender: "David Kim",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isOwn: false,
        },
      ],
    },
    {
      id: "5",
      name: "Lisa Wang",
      avatar: "LW",
      lastMessage: "Could you review my portfolio?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      unreadCount: 1,
      messages: [
        {
          id: "12",
          text: "Hi! I'm working on my portfolio and would love your feedback.",
          sender: "Lisa Wang",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7), // 7 hours ago
          isOwn: false,
        },
        {
          id: "13",
          text: "Could you review my portfolio? I've been working on it for weeks.",
          sender: "Lisa Wang",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          isOwn: false,
        },
      ],
    },
    {
      id: "6",
      name: "Alex Thompson",
      avatar: "AT",
      lastMessage: "The startup is looking for a CTO",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      unreadCount: 0,
      messages: [
        {
          id: "14",
          text: "Hey! Remember that startup I told you about?",
          sender: "Alex Thompson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 13), // 13 hours ago
          isOwn: false,
        },
        {
          id: "15",
          text: "Yes, what about it?",
          sender: user?.name || "You",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12.5), // 12.5 hours ago
          isOwn: true,
        },
        {
          id: "16",
          text: "The startup is looking for a CTO. I thought you might be interested!",
          sender: "Alex Thompson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          isOwn: false,
        },
      ],
    },
    {
      id: "7",
      name: "Maria Garcia",
      avatar: "MG",
      lastMessage: "Thanks for the mentorship!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      unreadCount: 0,
      messages: [
        {
          id: "17",
          text: "I wanted to thank you for all the career advice you've given me.",
          sender: "Maria Garcia",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19), // 19 hours ago
          isOwn: false,
        },
        {
          id: "18",
          text: "Thanks for the mentorship! I got the job at Microsoft!",
          sender: "Maria Garcia",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
          isOwn: false,
        },
      ],
    },
    {
      id: "8",
      name: "James Wilson",
      avatar: "JW",
      lastMessage: "Are you free for a quick call?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      unreadCount: 3,
      messages: [
        {
          id: "19",
          text: "Hi! I have a quick question about the React project we discussed.",
          sender: "James Wilson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5), // 2.5 days ago
          isOwn: false,
        },
        {
          id: "20",
          text: "Are you free for a quick call? I'd love to get your input on the architecture.",
          sender: "James Wilson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          isOwn: false,
        },
      ],
    },
    {
      id: "9",
      name: "Rachel Brown",
      avatar: "RB",
      lastMessage: "The conference was incredible!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      unreadCount: 0,
      messages: [
        {
          id: "21",
          text: "Just got back from the React Conference!",
          sender: "Rachel Brown",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3.5), // 3.5 days ago
          isOwn: false,
        },
        {
          id: "22",
          text: "The conference was incredible! Learned so much about React 18.",
          sender: "Rachel Brown",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          isOwn: false,
        },
      ],
    },
    {
      id: "10",
      name: "Kevin Lee",
      avatar: "KL",
      lastMessage: "Can you help with the interview prep?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      unreadCount: 1,
      messages: [
        {
          id: "23",
          text: "I have an interview at Amazon next week.",
          sender: "Kevin Lee",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4.5), // 4.5 days ago
          isOwn: false,
        },
        {
          id: "24",
          text: "Can you help with the interview prep? I'm really nervous!",
          sender: "Kevin Lee",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
          isOwn: false,
        },
      ],
    },
  ]);

  const activeConv = conversations.find(
    (conv) => conv.id === activeConversation
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConv) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: user?.name || "You",
        timestamp: new Date(),
        isOwn: true,
      };

      // In a real app, this would be sent to the backend
      console.log("Sending message:", message);
      setNewMessage("");
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

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  activeConversation === conversation.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setActiveConversation(conversation.id)}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {activeConv.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {activeConv.name}
                    </h3>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Phone className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Video className="w-4 h-4" />
                  </motion.button>
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
                {activeConv.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
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
      </div>
    </div>
  );
};

export default Chat;
