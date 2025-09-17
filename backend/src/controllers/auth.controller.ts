import type { Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const frontend_url = process.env.FRONTEND_URL;
const backend_url = process.env.API_URL;
const getAccessToken = async (code: string) => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirect_uri: `${backend_url}/api/linkedin/callback`,
  });
  const response = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const accessToken = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  return accessToken;
};

const getUserData = async (accessToken: string) => {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const userData = (await response.json()) as {
    name: string;
    email: string;
    picture: string;
  };
  return userData;
};

export const linkedInCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Get access token
    const accessToken = await getAccessToken(code);

    // Get user data using access token
    const userData = await getUserData(accessToken.access_token);

    if (!userData) {
      return res.status(400).json({ error: "User data not found" });
    }

    // check if user is registered

    let user;

    user = await User.findOne({ email: userData.email });

    if (!user) {
      user = new User({
        name: userData.name,
        email: userData.email,
        avatar: userData.picture,
      });

      await user.save();
    }

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET!
    );

    res.cookie("token", token, {
      httpOnly: false, // Allow JavaScript to access the cookie
      secure: true, // true for HTTPS in production
      sameSite: "none", // Required for cross-origin cookies
    });

    res.redirect(`${frontend_url}/referrals`);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(403).json({
        success: false,
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Fetch complete user data from database
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        graduationYear: user.graduationYear,
        company: user.company,
        position: user.position,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(403).json({
      success: false,
      error: "Invalid token",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Find user by email since JWT contains email, not ID
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userId = user._id;

    const { name, graduationYear, company, position, resume } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (graduationYear !== undefined) {
      updateData.graduationYear = graduationYear;
    }
    if (company !== undefined) {
      updateData.company = company.trim();
    }
    if (position !== undefined) {
      updateData.position = position.trim();
    }
    if (resume !== undefined) {
      updateData.resume = resume.trim();
    }

    // Validate required fields if provided
    if (updateData.name && updateData.name.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    if (
      updateData.graduationYear &&
      (updateData.graduationYear < 1900 ||
        updateData.graduationYear > new Date().getFullYear() + 10)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid graduation year",
      });
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        graduationYear: updatedUser.graduationYear,
        company: updatedUser.company,
        position: updatedUser.position,
        resume: updatedUser.resume,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};
