import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserService } from "../services/userService";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Building,
  Briefcase,
  Shield,
  Clock,
  FileText,
  Edit3,
  Save,
  X,
  ExternalLink,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeValue, setResumeValue] = useState(user?.resume || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    graduationYear: "",
    company: "",
    position: "",
    resume: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const userService = getUserService();

  const handleResumeEdit = () => {
    setIsEditingResume(true);
    setResumeValue(user?.resume || "");
  };

  const handleResumeSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const result = await userService.updateUserProfileFromAPI({
        resume: resumeValue,
      });

      if (result.success && result.user) {
        // Update local user state
        updateUser(result.user);
        setIsEditingResume(false);
      } else {
        alert(result.message || "Failed to update resume. Please try again.");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Failed to update resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeCancel = () => {
    setIsEditingResume(false);
    setResumeValue(user?.resume || "");
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeValue(e.target.value);
  };

  const handleOpenUpdateModal = () => {
    if (!user) return;

    setUpdateFormData({
      graduationYear: user.graduationYear?.toString() || "",
      company: user.company || "",
      position: user.position || "",
      resume: user.resume || "",
    });
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateFormData({
      graduationYear: "",
      company: "",
      position: "",
      resume: "",
    });
  };

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateFormData({ ...updateFormData, [field]: value });
  };

  const handleBulkUpdate = async () => {
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const updateData: any = {};

      // Only include fields that have been changed (excluding non-editable fields)
      if (
        updateFormData.graduationYear !==
        (user.graduationYear?.toString() || "")
      ) {
        updateData.graduationYear = updateFormData.graduationYear
          ? parseInt(updateFormData.graduationYear)
          : undefined;
      }
      if (updateFormData.company !== (user.company || "")) {
        updateData.company = updateFormData.company.trim();
      }
      if (updateFormData.position !== (user.position || "")) {
        updateData.position = updateFormData.position.trim();
      }
      if (updateFormData.resume !== (user.resume || "")) {
        updateData.resume = updateFormData.resume.trim();
      }

      // If no changes, just close the modal
      if (Object.keys(updateData).length === 0) {
        handleCloseUpdateModal();
        return;
      }

      const result = await userService.updateUserProfileFromAPI(updateData);

      if (result.success && result.user) {
        // Update local user state
        updateUser(result.user);
        handleCloseUpdateModal();
        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

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
      label: "Resume",
      value: user.resume || "-",
      icon: FileText,
      required: false,
      isResume: true,
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

            {/* Update Profile Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4"
            >
              <motion.button
                onClick={handleOpenUpdateModal}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit3 size={16} className="mr-2" />
                Update Profile
              </motion.button>
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
                            ) : field.isResume ? (
                              <div className="space-y-2">
                                {isEditingResume ? (
                                  <div className="space-y-2">
                                    <input
                                      type="url"
                                      value={resumeValue}
                                      onChange={handleResumeChange}
                                      placeholder="Enter Google Drive link to your resume"
                                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                    />
                                    <div className="flex space-x-2">
                                      <motion.button
                                        onClick={handleResumeSave}
                                        disabled={isSaving}
                                        className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        {isSaving ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        ) : (
                                          <Save size={12} className="mr-1" />
                                        )}
                                        {isSaving ? "Saving..." : "Save"}
                                      </motion.button>
                                      <motion.button
                                        onClick={handleResumeCancel}
                                        className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <X size={12} className="mr-1" />
                                        Cancel
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      {isValueEmpty ? (
                                        <p className="text-gray-500 text-base font-semibold">
                                          No resume uploaded
                                        </p>
                                      ) : (
                                        <div className="flex items-center space-x-2">
                                          <a
                                            href={field.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-base font-semibold truncate flex items-center"
                                          >
                                            <FileText
                                              size={16}
                                              className="mr-1 flex-shrink-0"
                                            />
                                            View Resume
                                            <ExternalLink
                                              size={12}
                                              className="ml-1 flex-shrink-0"
                                            />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                    <motion.button
                                      onClick={handleResumeEdit}
                                      className="flex items-center px-2 py-1 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 text-xs rounded-lg transition-colors ml-2"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Edit3 size={12} className="mr-1" />
                                      Edit
                                    </motion.button>
                                  </div>
                                )}
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

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card p-8 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Update Profile
              </h3>
              <p className="text-gray-300">
                Update your optional profile information below
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Note: Name, email, role, and member since cannot be changed
              </p>
            </div>

            <div className="space-y-4">
              {/* Graduation Year Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={updateFormData.graduationYear}
                  onChange={(e) =>
                    handleUpdateFormChange("graduationYear", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                />
              </div>

              {/* Company Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={updateFormData.company}
                  onChange={(e) =>
                    handleUpdateFormChange("company", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your company name"
                />
              </div>

              {/* Position Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={updateFormData.position}
                  onChange={(e) =>
                    handleUpdateFormChange("position", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your job position"
                />
              </div>

              {/* Resume Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resume Link
                </label>
                <input
                  type="url"
                  value={updateFormData.resume}
                  onChange={(e) =>
                    handleUpdateFormChange("resume", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter Google Drive link to your resume"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-4 mt-8">
              <motion.button
                onClick={handleCloseUpdateModal}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleBulkUpdate}
                disabled={isUpdatingProfile}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUpdatingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Update Profile
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
