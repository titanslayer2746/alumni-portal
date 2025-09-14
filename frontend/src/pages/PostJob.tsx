import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jobService } from "../services/jobService";
import type { JobFormData } from "../types/job";
import {
  Briefcase,
  Building2,
  DollarSign,
  Clock,
  User,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const PostJob: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<JobFormData>({
    role: "",
    company: "",
    type: "intern",
    workExperience: "",
    internExperience: "",
    duration: "",
    compensation: {
      amount: "",
      currency: "INR" as const,
    },
    description: "",
    requirements: [""],
    benefits: [""],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "compensationAmount") {
      setFormData((prev) => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          amount: value,
        },
      }));
    } else if (name === "compensationCurrency") {
      setFormData((prev) => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          currency: value as "INR" | "USD",
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (
    field: "requirements" | "benefits",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    field: "requirements" | "benefits",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.role.trim()) {
      newErrors.role = "Referral role is required";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }
    if (!formData.workExperience.trim()) {
      newErrors.workExperience = "Work experience requirement is required";
    }
    if (!formData.internExperience.trim()) {
      newErrors.internExperience = "Intern experience requirement is required";
    }
    if (!formData.compensation.amount.trim()) {
      newErrors.compensation = "Compensation amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Referral description is required";
    }

    // Requirements and benefits are now optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({}); // Clear errors when moving to next step
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({}); // Clear errors when going back
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || (user.role !== "alumni" && user.role !== "admin")) {
      alert("Only alumni and admin users can post referrals");
      return;
    }

    // Validate step 2 before submitting
    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty requirements and benefits
      const filteredData = {
        ...formData,
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        benefits: formData.benefits.filter((benefit) => benefit.trim() !== ""),
      };

      jobService.addJob(filteredData, user.name);

      // Redirect to referral board
      navigate("/referrals");
    } catch (error) {
      alert("Error posting referral. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated or not alumni
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
            Please log in to post referral opportunities
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

  if (user?.role !== "alumni" && user?.role !== "admin") {
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
            <User className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-300 mb-6">
            Only alumni and admin users can post referral opportunities
          </p>
          <motion.button
            onClick={() => navigate("/referrals")}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Referral Board
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-12">
        {/* Header */}
        <motion.div
          className="mb-12 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => navigate("/referrals")}
            className="flex items-center text-pink-400 hover:text-pink-300 mb-8 transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Referral Board
          </motion.button>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 glow-text">
            Post a Referral Opportunity
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Share referral opportunities with current students and help them
            advance their careers
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center ${
                currentStep >= 1 ? "text-pink-400" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-pink-500 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? "bg-pink-500" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                currentStep >= 2 ? "text-pink-400" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2
                    ? "bg-pink-500 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Step 1: Basic Information & Experience */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Basic Information */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-pink-400" />
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Referral Role *
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                          errors.role ? "border-red-500" : "border-white/20"
                        }`}
                        placeholder="e.g., Software Engineer Intern"
                      />
                      {errors.role && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                          errors.company ? "border-red-500" : "border-white/20"
                        }`}
                        placeholder="e.g., Google, Microsoft"
                      />
                      {errors.company && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Referral Type *
                      </label>
                      <select
                        id="type"
                        name="type"
                        required
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                      >
                        <option value="intern" className="bg-gray-800">
                          Internship
                        </option>
                        <option value="intern+ppo" className="bg-gray-800">
                          Internship + PPO
                        </option>
                        <option value="fulltime" className="bg-gray-800">
                          Full Time
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Duration *
                      </label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        required
                        value={formData.duration}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                          errors.duration ? "border-red-500" : "border-white/20"
                        }`}
                        placeholder="e.g., 6 months, Full-time"
                      />
                      {errors.duration && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience & Compensation */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-pink-400" />
                    Experience & Compensation
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="workExperience"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Work Experience Required *
                      </label>
                      <input
                        type="text"
                        id="workExperience"
                        name="workExperience"
                        required
                        value={formData.workExperience}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                          errors.workExperience
                            ? "border-red-500"
                            : "border-white/20"
                        }`}
                        placeholder="e.g., 0-1 years, 1-3 years"
                      />
                      {errors.workExperience && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.workExperience}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="internExperience"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Intern Experience Required *
                      </label>
                      <input
                        type="text"
                        id="internExperience"
                        name="internExperience"
                        required
                        value={formData.internExperience}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                          errors.internExperience
                            ? "border-red-500"
                            : "border-white/20"
                        }`}
                        placeholder="e.g., 0-6 months, 6+ months"
                      />
                      {errors.internExperience && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.internExperience}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-2">
                        Compensation (per month) *
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            id="compensationAmount"
                            name="compensationAmount"
                            required
                            value={formData.compensation.amount}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                              errors.compensation
                                ? "border-red-500"
                                : "border-white/20"
                            }`}
                            placeholder="e.g., 25000, 800000"
                          />
                        </div>
                        <div className="w-24">
                          <select
                            id="compensationCurrency"
                            name="compensationCurrency"
                            value={formData.compensation.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white"
                          >
                            <option value="INR" className="bg-gray-800">
                              ₹ INR
                            </option>
                            <option value="USD" className="bg-gray-800">
                              $ USD
                            </option>
                          </select>
                        </div>
                      </div>
                      {errors.compensation && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.compensation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Referral Description, Requirements & Benefits */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Description */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-pink-400" />
                    Referral Description
                  </h2>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Referral Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 ${
                        errors.description
                          ? "border-red-500"
                          : "border-white/20"
                      }`}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                    />
                    {errors.description && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Requirements
                  </h2>

                  <div className="space-y-3">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) =>
                            handleArrayChange(
                              "requirements",
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                          placeholder="Enter a requirement..."
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("requirements", index)
                            }
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("requirements")}
                      className="flex items-center text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Requirement
                    </button>
                    {errors.requirements && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.requirements}
                      </p>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Benefits
                  </h2>

                  <div className="space-y-3">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) =>
                            handleArrayChange("benefits", index, e.target.value)
                          }
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400"
                          placeholder="Enter a benefit..."
                        />
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("benefits", index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("benefits")}
                      className="flex items-center text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Benefit
                    </button>
                    {errors.benefits && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.benefits}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between space-x-4">
              <div>
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/referrals")}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </div>
                    ) : (
                      "Post Referral Opportunity"
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
