import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Briefcase,
  Home,
  MessageCircle,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className="glass-card fixed top-0 left-0 right-0 z-50 mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-32 mt-4 sm:mt-6 md:mt-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center pulse-glow">
                  <span className="text-white font-bold text-sm sm:text-lg">
                    A
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-white glow-text">
                  Alumniiio
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/referrals"
                  className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  <Briefcase size={18} />
                  <span>Referral Board</span>
                </Link>
              </motion.div>
              {(user?.role === "alumni" || user?.role === "admin") && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/post-referral"
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10"
                  >
                    <Plus size={18} />
                    <span>Post Referral</span>
                  </Link>
                </motion.div>
              )}
              {user?.role === "admin" && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10"
                  >
                    <Settings size={18} />
                    <span>Admin</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Messages Button */}
                  <motion.button
                    onClick={handleChatClick}
                    className="p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10 relative"
                    title="Messages"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle size={18} />
                    {/* Notification Badge */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                  </motion.button>

                  <motion.div
                    className="flex items-center space-x-3 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate("/profile")}
                  >
                    <Avatar
                      src={user?.avatar}
                      name={user?.name || "User"}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10"
                    title="Logout"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <LogOut size={18} />
                  </motion.button>
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="btn btn-primary">
                    Login
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {isAuthenticated && (
                <motion.button
                  onClick={handleChatClick}
                  className="p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10 relative"
                  title="Messages"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle size={18} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </motion.button>
              )}
              <motion.button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeMobileMenu}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="absolute top-0 right-0 w-80 max-w-[90vw] h-full glass-card"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center pulse-glow">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <span className="text-xl font-bold text-white glow-text">
                      Alumniiio
                    </span>
                  </div>
                  <motion.button
                    onClick={closeMobileMenu}
                    className="p-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* User Info */}
                {isAuthenticated && user && (
                  <div className="mb-8 p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar src={user.avatar} name={user.name} size="lg" />
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        navigate("/profile");
                        closeMobileMenu();
                      }}
                      className="w-full text-left text-gray-300 hover:text-white transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      View Profile
                    </motion.button>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <Home size={20} />
                      <span>Home</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/referrals"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <Briefcase size={20} />
                      <span>Referral Board</span>
                    </Link>
                  </motion.div>

                  {(user?.role === "alumni" || user?.role === "admin") && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/post-referral"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <Plus size={20} />
                        <span>Post Referral</span>
                      </Link>
                    </motion.div>
                  )}

                  {user?.role === "admin" && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                      >
                        <Settings size={20} />
                        <span>Admin Panel</span>
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <motion.button
                        onClick={() => {
                          handleChatClick();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageCircle size={20} />
                        <span>Messages</span>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="w-full flex items-center justify-center btn btn-primary"
                      >
                        Login
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
