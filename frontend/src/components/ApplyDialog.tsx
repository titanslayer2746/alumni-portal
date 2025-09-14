import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import NotificationDialog from "./NotificationDialog";

interface ApplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  onApply: (resumeFile: File) => Promise<boolean>; // Return success/failure
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  onApply,
}) => {
  const [step, setStep] = useState<"upload" | "confirm">("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Invalid File Type",
          message: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "File Too Large",
          message: "File size must be less than 5MB",
        });
        return;
      }

      setResumeFile(file);
      setStep("confirm");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!resumeFile) return;

    setIsSubmitting(true);

    try {
      // Call the onApply function and wait for result
      const success = await onApply(resumeFile);

      if (success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Application Submitted!",
          message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully. You'll receive a confirmation email shortly.`,
        });
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
    onClose();
    // Reset state
    setStep("upload");
    setResumeFile(null);
  };

  const handleNotificationClose = () => {
    setNotification({ isOpen: false, type: "success", title: "", message: "" });
    // If it was a success notification, close the entire dialog
    if (notification.type === "success") {
      handleClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            className="glass-card p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Step 1: Upload Resume */}
            {step === "upload" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Upload className="w-8 h-8 text-blue-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-sm text-gray-300">
                    Please upload your resume in PDF or Word format
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    onClick={handleUploadClick}
                    className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                      <p className="text-white font-medium mb-1">
                        Click to upload resume
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                  </motion.button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirmation */}
            {step === "confirm" && resumeFile && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Confirm Application
                  </h3>
                  <p className="text-sm text-gray-300">
                    Review your resume and submit your application
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(resumeFile.size)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">
                        Application Details
                      </p>
                      <p className="text-xs text-gray-300">
                        Your application will be sent to the hiring team. You'll
                        receive a confirmation email shortly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setStep("upload")}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
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
