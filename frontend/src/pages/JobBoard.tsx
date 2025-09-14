import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobService } from "../services/jobService";
import type { JobPosting, JobType } from "../types/job";
import {
  Briefcase,
  MapPin,
  Clock,
  User,
  Calendar,
  Filter,
  Search,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobCardSkeleton } from "../components/SkeletonLoader";
import ApplyDialog from "../components/ApplyDialog";

const JobBoard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<JobType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [applyDialog, setApplyDialog] = useState<{
    isOpen: boolean;
    job: JobPosting | null;
  }>({ isOpen: false, job: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    job: JobPosting | null;
  }>({ isOpen: false, job: null });

  useEffect(() => {
    // Initialize sample data if needed
    jobService.initializeSampleData();

    // Load jobs
    const allJobs = jobService.getAllJobs();
    setJobs(allJobs);
    setFilteredJobs(allJobs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Filter jobs based on search term and type
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.postedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((job) => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedType]);

  const handleDeleteJob = (jobId: string) => {
    if (user && jobService.deleteJob(jobId, user.name)) {
      const updatedJobs = jobService.getAllJobs();
      setJobs(updatedJobs);
    }
  };

  const handleAdminDeleteJob = (job: JobPosting) => {
    setDeleteDialog({ isOpen: true, job });
  };

  const confirmDelete = () => {
    if (deleteDialog.job && user?.role === "admin") {
      if (jobService.deleteJobAsAdmin(deleteDialog.job.id)) {
        const updatedJobs = jobService.getAllJobs();
        setJobs(updatedJobs);
      }
    }
    setDeleteDialog({ isOpen: false, job: null });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, job: null });
  };

  const handleApplyClick = (job: JobPosting) => {
    setApplyDialog({ isOpen: true, job });
  };

  const handleApplyClose = () => {
    setApplyDialog({ isOpen: false, job: null });
  };

  const handleApplySubmit = async (resumeFile: File): Promise<boolean> => {
    try {
      // Here you would typically send the application to your backend
      console.log("Application submitted:", {
        job: applyDialog.job,
        resume: resumeFile,
        applicant: user?.name,
      });

      // Simulate API call with random success/failure for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.2; // 80% success rate

      return success;
    } catch (error) {
      console.error("Error submitting application:", error);
      return false;
    }
  };

  const getTypeColor = (type: JobType) => {
    switch (type) {
      case "intern":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intern+ppo":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "fulltime":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <Briefcase className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Access Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please log in to view referral opportunities
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login" className="btn btn-primary">
              Login to Continue
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 glow-text">
                Referral Board
              </h1>
              <p className="text-gray-300">
                Discover opportunities posted by our alumni network
              </p>
            </div>
            {user?.role === "alumni" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/post-referral"
                  className="btn btn-primary mt-4 md:mt-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Referral
                </Link>
              </motion.div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search referrals, companies, or alumni..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as JobType | "all")
                  }
                  className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                >
                  <option value="all" className="bg-gray-800">
                    All Types
                  </option>
                  <option value="intern" className="bg-gray-800">
                    Internship
                  </option>
                  <option value="intern+ppo" className="bg-gray-800">
                    Intern + PPO
                  </option>
                  <option value="fulltime" className="bg-gray-800">
                    Full Time
                  </option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
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
              <Briefcase className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No referrals found
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm || selectedType !== "all"
                ? "Try adjusting your search criteria"
                : "Be the first to post a referral opportunity"}
            </p>
            {user?.role === "alumni" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/post-referral" className="btn btn-primary">
                  Post a Referral
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="card-3d p-6 group relative h-fit"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Delete button for alumni who posted the job or admin */}
                  {((user?.role === "alumni" && user.name === job.postedBy) ||
                    user?.role === "admin") && (
                    <motion.button
                      onClick={() =>
                        user?.role === "admin"
                          ? handleAdminDeleteJob(job)
                          : handleDeleteJob(job.id)
                      }
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title={
                        user?.role === "admin"
                          ? "Delete referral posting (Admin)"
                          : "Delete referral posting"
                      }
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}

                  {/* Header with Job Type Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                        job.type
                      )}`}
                    >
                      {job.type === "intern+ppo"
                        ? "Intern + PPO"
                        : job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                    </span>
                  </div>

                  {/* Main Content - Two Column Layout */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1 line-clamp-2">
                          {job.role}
                        </h3>
                        <p className="text-sm text-gray-300 font-medium">
                          {job.company}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <span className="text-gray-300 font-medium">
                            {job.compensation.currency === "INR" ? "₹" : "$"}
                            {job.compensation.amount}
                          </span>
                        </div>

                        <div className="flex items-center text-xs">
                          <Clock className="w-3 h-3 mr-1 text-pink-400 flex-shrink-0" />
                          <span className="text-gray-300">{job.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Briefcase className="w-3 h-3 mr-1 text-pink-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            Work: {job.workExperience}
                          </span>
                        </div>

                        <div className="flex items-center text-xs">
                          <Briefcase className="w-3 h-3 mr-1 text-pink-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            Intern: {job.internExperience}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Posted By and Date */}
                  <div className="pt-2 border-t border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{job.postedBy}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(job.postedAt)}</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <motion.button
                      onClick={() => handleApplyClick(job)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results count */}
        {filteredJobs.length > 0 && (
          <motion.div
            className="mt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Showing {filteredJobs.length} of {jobs.length} referral
            {jobs.length !== 1 ? "s" : ""}
          </motion.div>
        )}
      </div>

      {/* Apply Dialog */}
      {applyDialog.job && (
        <ApplyDialog
          isOpen={applyDialog.isOpen}
          onClose={handleApplyClose}
          jobTitle={applyDialog.job.role}
          companyName={applyDialog.job.company}
          onApply={handleApplySubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.job && (
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
                Delete Job Posting
              </h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete this job posting?
              </p>
              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                <div className="text-white font-medium">
                  {deleteDialog.job.role}
                </div>
                <div className="text-gray-300 text-sm">
                  {deleteDialog.job.company}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Posted by {deleteDialog.job.postedBy}
                </div>
              </div>
              <p className="text-red-400 text-sm mb-6">
                This action cannot be undone.
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
  );
};

export default JobBoard;
