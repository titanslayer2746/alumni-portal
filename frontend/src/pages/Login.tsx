import React, { useState } from "react";
import { User } from "lucide-react";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if environment variable is available
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      if (!clientId) {
        setError(
          "LinkedIn integration not configured. Please contact administrator."
        );
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: "http://localhost:3001/api/linkedin/callback",
        scope: "openid email profile",
      });

      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    } catch (error) {
      setError("Failed to initiate LinkedIn login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center pulse-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white glow-text">
            Welcome to Alumniiio
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in with your LinkedIn account to connect with fellow alumni
          </p>
        </motion.div>

        <motion.div
          className="mt-8 space-y-6 glass-card p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            <motion.button
              onClick={handleLinkedInLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  {/* LinkedIn Icon */}
                  <svg
                    className="w-5 h-5 mr-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Sign in with LinkedIn
                </div>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-xs text-gray-500">
            Demo Mode: This will simulate a LinkedIn login with mock data
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
