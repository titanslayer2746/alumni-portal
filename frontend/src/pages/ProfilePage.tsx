import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Building,
  Briefcase,
  Shield,
  Clock,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">User not found</h2>
          <p className="text-gray-400">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "alumni":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "student":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const profileFields = [
    {
      label: "Name",
      value: user.name,
      icon: UserIcon,
      required: true,
    },
    {
      label: "Email",
      value: user.email,
      icon: Mail,
      required: true,
    },
    {
      label: "Role",
      value: user.role,
      icon: Shield,
      required: true,
      isRole: true,
    },
    {
      label: "Graduation Year",
      value: user.graduationYear?.toString() || "-",
      icon: Calendar,
      required: false,
    },
    {
      label: "Company",
      value: user.company || "-",
      icon: Building,
      required: false,
    },
    {
      label: "Position",
      value: user.position || "-",
      icon: Briefcase,
      required: false,
    },
    {
      label: "Member Since",
      value: formatDate(user.createdAt),
      icon: Clock,
      required: true,
    },
  ];

  return (
    <div className="flex items-center justify-center p-4 -mt-19 pt-32">
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 h-[calc(100vh-16rem)] flex"
        >
          {/* Left Half - Avatar Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-1/2 flex flex-col items-center justify-center pr-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-40 h-40 mb-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center overflow-hidden relative"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={50} className="text-white" />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full"></div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2 glow-text text-center"
            >
              {user.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium capitalize ${getRoleColor(
                user.role
              )}`}
            >
              <Shield size={14} className="mr-1" />
              {user.role}
            </motion.div>
          </motion.div>

          {/* Right Half - Information Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-1/2 pl-6 border-l border-white/10"
          >
            <div className="h-full flex flex-col">
              {/* Profile Information */}
              <div className="flex-1 overflow-y-auto pr-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  {profileFields.map((field, index) => {
                    const IconComponent = field.icon;
                    const isValueEmpty = field.value === "-";

                    return (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            <div className="w-7 h-7 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-red-500/30 transition-all duration-300">
                              <IconComponent
                                size={14}
                                className={`${
                                  isValueEmpty
                                    ? "text-gray-500"
                                    : "text-pink-400"
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                                {field.label}
                              </h3>
                              {field.required && (
                                <span className="text-xs text-pink-400 bg-pink-400/10 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>

                            {field.isRole ? (
                              <div
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(
                                  field.value
                                )}`}
                              >
                                <Shield size={14} className="mr-2" />
                                {field.value}
                              </div>
                            ) : (
                              <p
                                className={`text-base font-semibold ${
                                  isValueEmpty ? "text-gray-500" : "text-white"
                                }`}
                              >
                                {field.value}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-3 pt-2 border-t border-white/10"
              >
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Profile created on {formatDate(user.createdAt)}</p>
                  <p>
                    Last updated:{" "}
                    {user.updatedAt ? formatDate(user.updatedAt) : "Never"}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
