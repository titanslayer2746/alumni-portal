import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Clock, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PendingPage: React.FC = () => {
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
              className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center pulse-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Clock className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white glow-text">
            Verification in Progress
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Your account is under review
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="glass-card p-8 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Status Message */}
          <div className="text-center space-y-4">
            <motion.div
              className="flex items-center justify-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-lg font-medium text-white">
                Application Submitted Successfully
              </span>
            </motion.div>

            <p className="text-gray-300 text-center leading-relaxed">
              Thank you for joining our alumni community! Your identity has been
              submitted for verification. Our team is currently reviewing your
              credentials to ensure the integrity of our network.
            </p>
          </div>

          {/* User Info */}
          {user && (
            <motion.div
              className="bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-lg p-6 border border-pink-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-pink-400" />
                Application Details
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-yellow-400">Under Review</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h3 className="text-lg font-semibold text-white">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-gray-300">
                  Our verification team will review your submitted credentials
                  and LinkedIn profile
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-gray-300">
                  You'll receive an email notification once your verification is
                  complete
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-gray-300">
                  Once verified, you'll have full access to all platform
                  features and networking opportunities
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Expected Timeline
            </h3>
            <p className="text-gray-300">
              Verification typically takes{" "}
              <span className="text-blue-400 font-medium">
                1-3 business days
              </span>
              . During peak periods, it may take up to 5 business days. We
              appreciate your patience!
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
            Questions about your verification? Contact us at{" "}
            <a
              href="mailto:support@alumniiio.com"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              support@alumniiio.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PendingPage;
