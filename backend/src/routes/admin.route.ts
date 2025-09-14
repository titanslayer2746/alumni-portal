import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard statistics
router.get("/dashboard/stats", getDashboardStats);

// User management routes
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/profile", updateUserProfile);

export default router;
