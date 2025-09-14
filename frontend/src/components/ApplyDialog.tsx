import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import NotificationDialog from "./NotificationDialog";

interface ApplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  onApply: (coverLetter: string) => Promise<boolean>; // Return success/failure with cover letter
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  onApply,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Cover Letter Required",
        message:
          "Please write a cover letter before submitting your application.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the onApply function and wait for result
      const success = await onApply(coverLetter.trim());

      if (success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Application Submitted!",
          message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully. You'll receive a confirmation email shortly.`,
        });
        // Reset cover letter after successful submission
        setCoverLetter("");
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Application Failed",
          message:
            "There was an error submitting your application. Please try again or contact support if the problem persists.",
        });
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Application Failed",
        message:
          "There was an error submitting your application. Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCoverLetter(""); // Reset cover letter when closing
    onClose();
  };

  const handleNotificationClose = () => {
    setNotification({ isOpen: false, type: "success", title: "", message: "" });
    // If it was a success notification, close the entire dialog
    if (notification.type === "success") {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="glass-card p-4 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Apply for Position
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  {jobTitle} at {companyName}
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Cover Letter Input */}
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Cover Letter *
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter here..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400">
                    Your resume will be included automatically
                  </p>
                  <p className="text-xs text-gray-400">
                    {coverLetter.length}/1000
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={handleNotificationClose}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </AnimatePresence>
  );
};

export default ApplyDialog;
