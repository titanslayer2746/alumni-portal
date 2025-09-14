import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  deleteJob,
  applyToJob,
  searchJobs,
  getJobApplicants,
  updateApplicantStatus,
} from "../controllers/job.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const JobRoutes = express.Router();

// Public routes
JobRoutes.get("/search", searchJobs);
JobRoutes.get("/:id", getJobById);

// Protected routes (require authentication)
JobRoutes.get("/", authenticate, getAllJobs);

// Protected routes (require authentication)
JobRoutes.post("/", authenticate, createJob);
JobRoutes.delete("/:id", authenticate, deleteJob);
JobRoutes.post("/:id/apply", authenticate, applyToJob);
JobRoutes.get("/:id/applicants", authenticate, getJobApplicants);
JobRoutes.patch(
  "/:id/applications/:applicationId/status",
  authenticate,
  updateApplicantStatus
);

export default JobRoutes;
