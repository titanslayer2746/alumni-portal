import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  User,
  Users,
  MessageCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { chatService, type UserForConversation } from "../services/chatService";

interface UserSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSelectionDialog: React.FC<UserSelectionDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {} = useAuth();
  const { createConversation } = useChat();
  const [users, setUsers] = useState<UserForConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  // Load users when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      // Reset state when dialog closes
      setUsers([]);
      setSearchTerm("");
      setSelectedRole("all");
      setSelectedUsers(new Set());
      setError(null);
    }
  }, [isOpen]);

  // Load users when search or role changes
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        loadUsers();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedRole, isOpen]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatService.getUsersForConversation(
        1,
        50,
        searchTerm || undefined,
        selectedRole !== "all" ? selectedRole : undefined
      );
      setUsers(response.users);
    } catch (error) {
      console.error("Error loading users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.size === 0) return;

    try {
      setIsCreating(true);
      const participantIds = Array.from(selectedUsers);
      await createConversation(participantIds);
      onClose();
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create conversation"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "alumni":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "student":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Users className="w-3 h-3" />;
      case "alumni":
        return <User className="w-3 h-3" />;
      case "student":
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Start New Conversation
                </h2>
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-red-400 text-sm mb-2">
                    Error loading users
                  </p>
                  <p className="text-gray-500 text-xs">{error}</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-400 text-sm">
                    {searchTerm ? "No users found" : "No users available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUsers.has(user.id)
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => handleUserSelect(user.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          {selectedUsers.has(user.id) && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium truncate">
                              {user.name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 truncate">
                            {user.email}
                          </p>
                          {user.company && (
                            <p className="text-xs text-gray-400 truncate">
                              {user.position} at {user.company}
                            </p>
                          )}
                          {user.graduationYear && (
                            <p className="text-xs text-gray-400">
                              Class of {user.graduationYear}
                            </p>
                          )}
                        </div>
                        {user.hasExistingConversation && (
                          <div className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                            Has conversation
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleCreateConversation}
                    disabled={selectedUsers.size === 0 || isCreating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {isCreating ? "Creating..." : "Start Conversation"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSelectionDialog;
