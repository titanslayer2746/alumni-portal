import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobService } from "../services/jobService";
import {
  Users,
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  FileText,
  Copy,
  ExternalLink,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

interface Applicant {
  id: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    graduationYear?: number;
    resume?: string;
    avatar: string;
  };
  appliedAt: string;
  status:
    | "pending"
    | "reviewed"
    | "accepted"
    | "rejected"
    | "shortlisted"
    | "hired";
  coverLetter?: string;
}

interface JobApplicantsData {
  job: {
    id: string;
    role: string;
    company: string;
  };
  applicants: Applicant[];
  totalApplicants: number;
}

const JobApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<JobApplicantsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverLetterDialog, setCoverLetterDialog] = useState<{
    isOpen: boolean;
    coverLetter: string;
    applicantName: string;
  }>({ isOpen: false, coverLetter: "", applicantName: "" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (id) {
      loadApplicants();
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        openDropdown &&
        !target.closest(".status-dropdown") &&
        !target.closest(".fixed")
      ) {
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

  const loadApplicants = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await jobService.getJobApplicants(id);
      setData(response);
    } catch (error) {
      console.error("Error loading applicants:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load applicants"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "shortlisted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "hired":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const openResume = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openCoverLetterDialog = (
    coverLetter: string,
    applicantName: string
  ) => {
    setCoverLetterDialog({
      isOpen: true,
      coverLetter,
      applicantName,
    });
  };

  const closeCoverLetterDialog = () => {
    setCoverLetterDialog({
      isOpen: false,
      coverLetter: "",
      applicantName: "",
    });
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: "pending" | "shortlisted" | "hired"
  ) => {
    if (!id) return;

    try {
      setIsUpdatingStatus(applicationId);
      setOpenDropdown(null);
      setDropdownPosition(null);

      const success = await jobService.updateApplicantStatus(
        id,
        applicationId,
        newStatus
      );

      if (success) {
        // Reload applicants to get updated data
        await loadApplicants();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const canEditStatus = () => {
    if (!data || !user) return false;

    // Check if user is admin or the job poster
    if (user.role === "admin") return true;

    // For alumni, check if they posted this job
    if (user.role === "alumni") {
      // We need to check if the current user posted this job
      // This would require additional data from the backend
      return true; // For now, allow all alumni to edit (can be refined later)
    }

    return false;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center glass-card p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Users className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Access Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please log in to view job applicants
          </p>
          <motion.button
            onClick={() => navigate("/login")}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login to Continue
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading applicants..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center glass-card p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Loading Applicants
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <motion.button
              onClick={() => navigate("/referrals")}
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Referrals
            </motion.button>
            <motion.button
              onClick={loadApplicants}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center glass-card p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            No Data Available
          </h2>
          <p className="text-gray-300 mb-6">Unable to load applicant data</p>
          <motion.button
            onClick={() => navigate("/referrals")}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Referrals
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-6">
            <motion.button
              onClick={() => navigate("/referrals")}
              className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 glow-text">
                Job Applicants ({data.totalApplicants})
              </h1>
              <p className="text-gray-300">
                {data.job.role} at {data.job.company}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Applicants Table */}
        {data.applicants.length === 0 ? (
          <motion.div
            className="text-center py-12 glass-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Users className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Applicants Yet
            </h3>
            <p className="text-gray-300">
              This job posting hasn't received any applications yet.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="glass-card overflow-hidden flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="overflow-x-auto h-full">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Graduation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cover Letter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.applicants.map((applicant, index) => (
                    <motion.tr
                      key={applicant.id}
                      className="hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-white">
                            {applicant.applicant.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {applicant.applicant.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {applicant.applicant.graduationYear
                            ? `Class of ${applicant.applicant.graduationYear}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {formatDate(applicant.appliedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {applicant.applicant.resume ? (
                          <div className="flex items-center gap-1">
                            <motion.button
                              onClick={() =>
                                openResume(applicant.applicant.resume!)
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-xs hover:bg-blue-600/30 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open
                            </motion.button>
                            <motion.button
                              onClick={() =>
                                copyToClipboard(applicant.applicant.resume!)
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded text-xs hover:bg-gray-600/30 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Copy className="w-3 h-3" />
                            </motion.button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No resume
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {applicant.coverLetter ? (
                          <motion.button
                            onClick={() =>
                              openCoverLetterDialog(
                                applicant.coverLetter!,
                                applicant.applicant.name
                              )
                            }
                            className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded text-xs hover:bg-purple-600/30 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FileText className="w-3 h-3" />
                            Cover Letter
                          </motion.button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No cover letter
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canEditStatus() ? (
                          <div className="relative status-dropdown">
                            <motion.button
                              ref={(el) =>
                                (buttonRefs.current[applicant.id] = el)
                              }
                              onClick={() => {
                                console.log(
                                  "Button clicked for applicant:",
                                  applicant.id
                                );
                                console.log(
                                  "Current openDropdown:",
                                  openDropdown
                                );

                                if (openDropdown === applicant.id) {
                                  // Close dropdown if it's already open
                                  console.log("Closing dropdown");
                                  setOpenDropdown(null);
                                  setDropdownPosition(null);
                                } else {
                                  // Open dropdown and calculate position
                                  console.log("Opening dropdown");
                                  const button =
                                    buttonRefs.current[applicant.id];
                                  if (button) {
                                    const rect = button.getBoundingClientRect();
                                    const position = {
                                      top: rect.bottom + 4,
                                      left: rect.left,
                                    };
                                    console.log(
                                      "Calculated position:",
                                      position
                                    );
                                    console.log("Button rect:", rect);
                                    setDropdownPosition(position);
                                  }
                                  setOpenDropdown(applicant.id);
                                }
                              }}
                              disabled={isUpdatingStatus === applicant.id}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                applicant.status
                              )} hover:opacity-80 transition-opacity disabled:opacity-50`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isUpdatingStatus === applicant.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <>
                                  {applicant.status.charAt(0).toUpperCase() +
                                    applicant.status.slice(1)}
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </motion.button>
                          </div>
                        ) : (
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              applicant.status
                            )}`}
                          >
                            {applicant.status.charAt(0).toUpperCase() +
                              applicant.status.slice(1)}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Dropdown Portal */}
      <AnimatePresence>
        {openDropdown && (
          <motion.div
            className="fixed bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-[100] min-w-36 flex flex-col overflow-hidden"
            style={{
              top: dropdownPosition?.top || 100,
              left: dropdownPosition?.left || 100,
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {["pending", "shortlisted", "hired"].map((status, index) => (
              <motion.button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  const applicant = data?.applicants.find(
                    (app) => app.id === openDropdown
                  );
                  if (applicant) {
                    handleStatusUpdate(
                      applicant.id,
                      status as "pending" | "shortlisted" | "hired"
                    );
                  }
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  data?.applicants.find((app) => app.id === openDropdown)
                    ?.status === status
                    ? "bg-white/5 text-white"
                    : "text-gray-300"
                } ${index === 0 ? "rounded-t-lg" : ""} ${
                  index === 2 ? "rounded-b-lg" : ""
                }`}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "pending"
                      ? "bg-yellow-400"
                      : status === "shortlisted"
                      ? "bg-blue-400"
                      : "bg-green-400"
                  }`}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Letter Dialog */}
      <AnimatePresence>
        {coverLetterDialog.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCoverLetterDialog}
          >
            <motion.div
              className="glass-card p-6 w-full max-w-5xl mx-4 max-h-[80vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Cover Letter</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    {coverLetterDialog.applicantName}
                  </p>
                </div>
                <motion.button
                  onClick={closeCoverLetterDialog}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                  {coverLetterDialog.coverLetter}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-4">
                <motion.button
                  onClick={closeCoverLetterDialog}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobApplicants;
