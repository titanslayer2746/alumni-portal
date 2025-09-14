import type { Request, Response } from "express";
import User from "../models/User.js";
import type { UserRole } from "../models/User.js";

// Get all users with pagination and filtering
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as UserRole;
    const status = req.query.status as "active" | "deleted";

    // Build filter object
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Build search query
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalItems = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles: UserRole[] = ["pending", "admin", "alumni", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Must be one of: pending, admin, alumni, student",
      });
    }

    // Prevent admin from changing their own role
    if (req.user?.id === id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user status (soft delete)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["active", "deleted"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'deleted'",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user?.id === id && status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${
        status === "deleted" ? "deleted" : "restored"
      } successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user profile (admin can update any user's profile)
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, company, position, resume, graduationYear } = req.body;

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (position !== undefined) updateData.position = position;
    if (resume !== undefined) updateData.resume = resume;
    if (graduationYear !== undefined)
      updateData.graduationYear = graduationYear;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get admin dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const deletedUsers = await User.countDocuments({ status: "deleted" });

    const pendingUsers = await User.countDocuments({ role: "pending" });
    const alumniUsers = await User.countDocuments({ role: "alumni" });
    const studentUsers = await User.countDocuments({ role: "student" });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        deletedUsers,
        roleDistribution: {
          pending: pendingUsers,
          alumni: alumniUsers,
          student: studentUsers,
          admin: adminUsers,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
