import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl w-full space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center pulse-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white glow-text">
            Access Denied
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            You don't have permission to access this page
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="glass-card p-8 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Error Message */}
          <div className="text-center space-y-4">
            <motion.div
              className="flex items-center justify-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <span className="text-lg font-medium text-white">
                Insufficient Permissions
              </span>
            </motion.div>

            <p className="text-gray-300 text-center leading-relaxed">
              This page is restricted to administrators only. You need admin
              privileges to access the admin panel.
            </p>
          </div>

          {/* User Info */}
          {user && (
            <motion.div
              className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg p-6 border border-red-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-400" />
                Current Access Level
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  <span className="text-red-400 capitalize">{user.role}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* What you can do */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h3 className="text-lg font-semibold text-white">
              What you can do:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-gray-300">
                  Return to the home page and explore available features
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-gray-300">
                  Browse job opportunities and connect with alumni
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-gray-300">
                  Contact support if you believe you should have admin access
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Need Admin Access?
            </h3>
            <p className="text-gray-300">
              If you believe you should have administrative privileges, please
              contact our support team at{" "}
              <a
                href="mailto:admin@alumniiio.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                admin@alumniiio.com
              </a>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <motion.button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Sign Out
            </motion.button>
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <p className="text-sm text-gray-400">
            Error Code: 403 - Forbidden Access
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
