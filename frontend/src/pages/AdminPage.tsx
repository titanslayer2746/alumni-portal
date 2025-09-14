import React, { useState, useEffect } from "react";
import type { AdminUser, UserRole, UserFilters } from "../types/user";
import { getUserService } from "../services/userService";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Trash2,
  UserCheck,
  Shield,
  Settings,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [selectedStatus, setSelectedStatus] = useState<
    "active" | "deleted" | ""
  >("active");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    [key: string]: "up" | "down";
  }>({});

  const userService = getUserService();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const currentFilters: UserFilters = {
        ...filters,
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
      };

      const result = userService.getUsersWithPagination(
        currentPage,
        currentFilters
      );
      setUsers(result.users);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isDropdownButton = target.closest("[data-dropdown-button]");
      const isDropdownContent = target.closest("[data-dropdown-content]");

      if (openDropdown && !isDropdownButton && !isDropdownContent) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteDialog({ isOpen: true, userId, userName });
  };

  const confirmDelete = () => {
    const success = userService.deleteUser(deleteDialog.userId);
    if (success) {
      loadUsers();
    }
    setDeleteDialog({ isOpen: false, userId: "", userName: "" });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, userId: "", userName: "" });
  };

  const handleApproveUser = (userId: string) => {
    const success = userService.updateUserRole(userId, "alumni");
    if (success) {
      loadUsers();
    }
  };

  const toggleDropdown = (userId: string, event: React.MouseEvent) => {
    if (openDropdown === userId) {
      setOpenDropdown(null);
      return;
    }

    // Check if there's enough space below
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const dropdownHeight = 120; // Approximate height of dropdown

    const position = spaceBelow < dropdownHeight ? "up" : "down";
    setDropdownPosition((prev) => ({ ...prev, [userId]: position }));
    setOpenDropdown(userId);
  };

  const selectRole = (userId: string, role: UserRole) => {
    const success = userService.updateUserRole(userId, role);
    if (success) {
      loadUsers();
    }
    setOpenDropdown(null);
  };

  const handleUpdateRole = (userId: string, role: UserRole) => {
    const success = userService.updateUserRole(userId, role);
    if (success) {
      loadUsers();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadUsers();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "alumni":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "student":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="min-h-screen py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center pulse-glow">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-600 bg-clip-text text-transparent">
              User Management
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage user accounts, roles, and permissions across the platform
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Filters Section */}
          <div className="p-6 border-b border-white/10">
            <motion.form
              onSubmit={handleSearch}
              className="flex flex-wrap gap-4 items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex-1 min-w-64">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, company..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Role
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value as UserRole | "");
                      handleFilterChange();
                    }}
                    className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="pending">Pending</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(
                      e.target.value as "active" | "deleted" | ""
                    );
                    handleFilterChange();
                  }}
                  className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </motion.form>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-3 p-6 border-b border-white/10 text-sm font-medium text-gray-300">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    User
                  </div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Company/Position</div>
                  <div>Joined</div>
                  <div>Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/10">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      className="grid grid-cols-6 gap-3 p-6 hover:bg-white/5 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <div className="flex items-center">
                        <div>
                          <div className="text-white font-medium">
                            {user.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </div>

                      <div className="text-white">
                        {user.company && (
                          <div className="font-medium">{user.company}</div>
                        )}
                        {user.position && (
                          <div className="text-gray-400 text-sm">
                            {user.position}
                          </div>
                        )}
                      </div>

                      <div className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <motion.button
                            onClick={(e) => toggleDropdown(user.id, e)}
                            data-dropdown-button
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 flex items-center space-x-2 min-w-[120px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="capitalize">{user.role}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                openDropdown === user.id ? "rotate-180" : ""
                              }`}
                            />
                          </motion.button>

                          {openDropdown === user.id && (
                            <motion.div
                              data-dropdown-content
                              className={`absolute left-0 w-full bg-gray-800 border border-gray-600 rounded-xl overflow-hidden z-10 shadow-lg ${
                                dropdownPosition[user.id] === "up"
                                  ? "bottom-full mb-1"
                                  : "top-full mt-1"
                              }`}
                              initial={{
                                opacity: 0,
                                y:
                                  dropdownPosition[user.id] === "up" ? 10 : -10,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{
                                opacity: 0,
                                y:
                                  dropdownPosition[user.id] === "up" ? 10 : -10,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {(
                                ["pending", "alumni", "student"] as UserRole[]
                              ).map((role) => (
                                <motion.button
                                  key={role}
                                  onClick={() => selectRole(user.id, role)}
                                  className={`w-full px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-white/10 ${
                                    user.role === role
                                      ? "text-pink-400 bg-pink-500/10"
                                      : "text-white"
                                  }`}
                                  whileHover={{
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <span className="capitalize">{role}</span>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </div>

                        <motion.button
                          onClick={() => handleApproveUser(user.id)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Assign Role"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="p-6 border-t border-white/10 bg-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Previous
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg"
                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    )
                  )}

                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        {deleteDialog.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Delete User
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="text-pink-400 font-medium">
                    {deleteDialog.userName}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
