import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { type UserRole } from "../models/User.js";

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        avatar: string;
        role: UserRole;
        graduationYear?: number;
        company?: string;
        position?: string;
        createdAt: Date;
      };
    }
  }
}

// JWT payload interface
interface JWTPayload {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate user and attach user data to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.token;

    console.log("Auth Middleware Debug:");
    console.log("- Cookies:", req.cookies);
    console.log("- Auth Header:", req.headers.authorization);
    console.log(
      "- Token from cookie:",
      token ? `${token.substring(0, 20)}...` : "null"
    );

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log(
          "- Token from header:",
          token ? `${token.substring(0, 20)}...` : "null"
        );
      }
    }

    if (!token) {
      console.log("- No token found, returning 401");
      res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Fetch complete user data from database
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Attach user data to request object
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      graduationYear: user.graduationYear,
      company: user.company,
      position: user.position,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({
      success: false,
      error: "Invalid token",
    });
  }
};

/**
 * Middleware to check if user has admin or alumni role
 * Must be used after authenticate middleware
 */
export const requireAdminOrAlumni = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const { role } = req.user;

  if (role !== "admin" && role !== "alumni") {
    res.status(403).json({
      success: false,
      error: "Access denied. Admin or Alumni role required.",
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has admin role only
 * Must be used after authenticate middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const { role } = req.user;

  if (role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Access denied. Admin role required.",
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has alumni role only
 * Must be used after authenticate middleware
 */
export const requireAlumni = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const { role } = req.user;

  if (role !== "alumni") {
    res.status(403).json({
      success: false,
      error: "Access denied. Alumni role required.",
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user is not pending (i.e., approved)
 * Must be used after authenticate middleware
 */
export const requireApproved = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const { role } = req.user;

  if (role === "pending") {
    res.status(403).json({
      success: false,
      error: "Access denied. Account approval pending.",
    });
    return;
  }

  next();
};
