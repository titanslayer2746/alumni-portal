import React, { useState, useEffect, useRef } from "react";
import type { AdminUser, UserRole, UserFilters } from "../types/user";
import { getUserService } from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Trash2, Check, ChevronDown, User } from "lucide-react";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [selectedStatus, setSelectedStatus] = useState<
    "active" | "deleted" | ""
  >("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const userService = getUserService();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentFilters: UserFilters = {
        ...filters,
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
      };

      const result = await userService.getUsersWithPagination(
        currentPage,
        currentFilters
      );
      setUsers(result.users);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      console.error("Error loading users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
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
        console.log("Closing dropdown due to outside click");
        setOpenDropdown(null);
        setDropdownPosition(null);
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

  const confirmDelete = async () => {
    const success = await userService.deleteUser(deleteDialog.userId);
    if (success) {
      loadUsers();
    }
    setDeleteDialog({ isOpen: false, userId: "", userName: "" });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, userId: "", userName: "" });
  };

  const handleApproveUser = async (userId: string) => {
    const success = await userService.updateUserRole(userId, "alumni");
    if (success) {
      loadUsers();
    }
  };

  const toggleDropdown = (userId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log(
      "Toggle dropdown for user:",
      userId,
      "currently open:",
      openDropdown
    );

    if (openDropdown === userId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
      return;
    }

    // Calculate position for portal dropdown
    const button = buttonRefs.current[userId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setOpenDropdown(userId);
  };

  const selectRole = async (userId: string, role: UserRole) => {
    try {
      console.log("Updating role for user:", userId, "to role:", role);
      const success = await userService.updateUserRole(userId, role);
      if (success) {
        console.log("Role updated successfully");
        loadUsers();
      } else {
        console.error("Failed to update role");
        setError("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update user role");
    } finally {
      setOpenDropdown(null);
      setDropdownPosition(null);
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
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 glow-text">
                User Management ({totalItems})
              </h1>
              <p className="text-gray-300 text-sm">
                Manage user accounts, roles, and permissions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Filters Section */}
          <div className="p-3 sm:p-4 border-b border-white/10">
            <motion.form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex-1 min-w-0">
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
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="w-full sm:w-auto">
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
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">All Roles</option>
                    <option value="pending">Pending</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

              <div className="w-full sm:w-auto">
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
                  className="w-full px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base"
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
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 text-center">
                  <p className="text-lg font-semibold mb-2">
                    Error Loading Users
                  </p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadUsers}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                        Role
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                        Company/Position
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                        Joined
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        className="hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-2 sm:mr-3">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-medium text-white truncate">
                                {user.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-300 truncate">
                                {user.email}
                              </div>
                              {/* Show role and status on mobile */}
                              <div className="sm:hidden flex gap-2 mt-1">
                                <span
                                  className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                                    user.role
                                  )}`}
                                >
                                  {user.role}
                                </span>
                                <span
                                  className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                                    user.status
                                  )}`}
                                >
                                  {user.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-white">
                            {user.company && (
                              <div className="font-medium">{user.company}</div>
                            )}
                            {user.position && (
                              <div className="text-gray-400 text-xs">
                                {user.position}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="relative">
                              <motion.button
                                ref={(el) => {
                                  buttonRefs.current[user.id] = el;
                                }}
                                onClick={(e) => toggleDropdown(user.id, e)}
                                data-dropdown-button
                                className="px-1 sm:px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 flex items-center space-x-1 min-w-[60px] sm:min-w-[80px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="capitalize text-xs hidden sm:inline">
                                  {user.role}
                                </span>
                                <span className="capitalize text-xs sm:hidden">
                                  {user.role.charAt(0)}
                                </span>
                                <ChevronDown
                                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                                    openDropdown === user.id ? "rotate-180" : ""
                                  }`}
                                />
                              </motion.button>
                            </div>

                            <motion.button
                              onClick={() =>
                                handleDeleteUser(user.id, user.name)
                              }
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="p-3 sm:p-4 border-t border-white/10 bg-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                  results
                </div>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm ${
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
                    className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm"
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

        {/* Role Dropdown Portal */}
        <AnimatePresence>
          {openDropdown && (
            <motion.div
              className="fixed bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 min-w-36 flex flex-col overflow-hidden"
              style={{
                top: dropdownPosition?.top || 100,
                left: dropdownPosition?.left || 100,
              }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              data-dropdown-content
            >
              {(["pending", "alumni", "student"] as UserRole[]).map(
                (role, index) => (
                  <motion.button
                    key={role}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Role clicked:",
                        role,
                        "for user:",
                        openDropdown
                      );
                      const user = users.find((u) => u.id === openDropdown);
                      if (user) {
                        selectRole(user.id, role);
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      users.find((u) => u.id === openDropdown)?.role === role
                        ? "bg-white/5 text-white"
                        : "text-gray-300"
                    } ${index === 0 ? "rounded-t-lg" : ""} ${
                      index === 2 ? "rounded-b-lg" : ""
                    }`}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        role === "pending"
                          ? "bg-yellow-400"
                          : role === "alumni"
                          ? "bg-green-400"
                          : "bg-blue-400"
                      }`}
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </motion.button>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
