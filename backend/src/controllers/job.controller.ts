import type { Request, Response } from "express";
import type { UserRole } from "../models/User.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
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

// Get all jobs with optional filtering and pagination
export const getAllJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      search,
      sortBy = "postedAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const userId = req.user?.id;

    // Build filter object
    const filter: any = {};

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { role: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { postedBy: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const jobs = await Job.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("postedBy", "name email avatar");
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    // Transform jobs to include user's application status
    const jobsWithApplicationStatus = jobs.map((job) => {
      const jobData = job.toJSON();
      let hasApplied = false;
      let applicationStatus = null;

      if (userId && job.applications) {
        const userApplication = job.applications.find(
          (app: any) => app.applicant.toString() === userId
        );
        if (userApplication) {
          hasApplied = true;
          applicationStatus = userApplication.status;
        }
      }

      return {
        ...jobData,
        hasApplied,
        applicationStatus,
      };
    });

    res.json({
      success: true,
      jobs: jobsWithApplicationStatus,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        jobsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching jobs",
    });
  }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "postedBy",
      "name email avatar company position"
    );
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      job: job.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching job",
    });
  }
};

// Create new job posting
export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      role,
      company,
      type,
      workExperience,
      internExperience,
      duration,
      compensation,
      description,
      requirements,
      benefits,
    } = req.body;

    // Validate required fields
    if (
      !role ||
      !company ||
      !type ||
      !workExperience ||
      !internExperience ||
      !duration ||
      !compensation
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate compensation object
    if (!compensation.amount || !compensation.currency) {
      return res.status(400).json({
        success: false,
        message: "Compensation amount and currency are required",
      });
    }

    // Create new job
    const newJob = new Job({
      role,
      company,
      type,
      workExperience,
      internExperience,
      duration,
      compensation,
      description: description || "",
      requirements: requirements || [],
      benefits: benefits || [],
      postedBy: req.user?.id,
    });

    const savedJob = await newJob.save();
    await savedJob.populate("postedBy", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: savedJob.toJSON(),
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating job",
    });
  }
};

// Delete job posting
export const deleteJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user can delete this job
    // Only the job poster or admin can delete
    if (job.postedBy.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this job",
      });
    }

    await Job.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting job",
    });
  }
};

// Apply to job
export const applyToJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { coverLetter } = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user has already applied
    const existingApplication = job.applications?.find(
      (app: any) => app.applicant.toString() === userId
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    // Get user's resume link from their profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add application to job
    const application = {
      applicant: userId as any, // Convert string to ObjectId
      appliedAt: new Date(),
      resumeFile: user.resume || undefined, // Use resume link from user profile
      coverLetter: coverLetter || "",
      status: "pending" as const,
    };

    if (!job.applications) {
      job.applications = [];
    }

    job.applications.push(application);
    await job.save();

    res.json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while submitting application",
    });
  }
};

// Get job applicants
export const getJobApplicants = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const job = await Job.findById(id).populate({
      path: "applications.applicant",
      select: "name email graduationYear resume avatar",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user can view applicants
    // Only the job poster or admin can view applicants
    if (job.postedBy.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view applicants for this job",
      });
    }

    // Transform applications to include applicant details
    const applicants =
      job.applications?.map((application: any) => ({
        id: application._id,
        applicant: {
          id: application.applicant._id,
          name: application.applicant.name,
          email: application.applicant.email,
          graduationYear: application.applicant.graduationYear,
          resume: application.applicant.resume,
          avatar: application.applicant.avatar,
        },
        appliedAt: application.appliedAt,
        status: application.status,
        coverLetter: application.coverLetter,
      })) || [];

    res.json({
      success: true,
      job: {
        id: job._id,
        role: job.role,
        company: job.company,
      },
      applicants,
      totalApplicants: applicants.length,
    });
  } catch (error) {
    console.error("Error fetching job applicants:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching applicants",
    });
  }
};

// Update applicant status
export const updateApplicantStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id, applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validate status
    const validStatuses = ["pending", "shortlisted", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, shortlisted, hired",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user can update applicant status
    // Only the job poster or admin can update status
    if (job.postedBy.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to update applicant status for this job",
      });
    }

    // Find and update the specific application
    const application = job.applications?.find(
      (app: any) => app._id.toString() === applicationId
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update the status
    application.status = status;
    await job.save();

    // If status is shortlisted, create a conversation
    if (status === "shortlisted") {
      try {
        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userId, application.applicant.toString()] },
          jobId: id,
          status: "active",
        });

        if (!existingConversation) {
          // Create new conversation
          const conversation = new Conversation({
            participants: [userId, application.applicant],
            initiatedBy: userId,
            jobId: id,
            applicationId: application._id,
            status: "active",
          });

          const savedConversation = await conversation.save();

          // Create system message
          const systemMessage = new Message({
            conversationId: savedConversation._id,
            senderId: userId,
            content: `Congratulations! You have been shortlisted for the ${job.role} position at ${job.company}. Let's discuss the next steps.`,
            type: "system",
            isRead: false,
          });

          await systemMessage.save();
        }
      } catch (error) {
        console.error("Error creating conversation from shortlisting:", error);
        // Don't fail the status update if conversation creation fails
      }
    }

    res.json({
      success: true,
      message: "Applicant status updated successfully",
      status: application.status,
    });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating applicant status",
    });
  }
};

// Search jobs with advanced filtering
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const {
      q, // search query
      type,
      company,
      workExperience,
      internExperience,
      minCompensation,
      maxCompensation,
      currency,
      page = 1,
      limit = 10,
      sortBy = "postedAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const filter: any = {};

    // Text search
    if (q) {
      filter.$or = [
        { role: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { postedBy: { $regex: q, $options: "i" } },
      ];
    }

    // Type filter
    if (type && type !== "all") {
      filter.type = type;
    }

    // Company filter
    if (company) {
      filter.company = { $regex: company, $options: "i" };
    }

    // Experience filters
    if (workExperience) {
      filter.workExperience = { $regex: workExperience, $options: "i" };
    }

    if (internExperience) {
      filter.internExperience = { $regex: internExperience, $options: "i" };
    }

    // Compensation filters
    if (minCompensation || maxCompensation || currency) {
      filter["compensation.currency"] = currency || { $exists: true };

      if (minCompensation || maxCompensation) {
        const compensationFilter: any = {};
        if (minCompensation) {
          compensationFilter.$gte = parseInt(minCompensation as string);
        }
        if (maxCompensation) {
          compensationFilter.$lte = parseInt(maxCompensation as string);
        }
        filter["compensation.amount"] = compensationFilter;
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const jobs = await Job.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("postedBy", "name email avatar");
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.json({
      success: true,
      jobs: jobs.map((job) => job.toJSON()),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        jobsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      filters: {
        query: q,
        type,
        company,
        workExperience,
        internExperience,
        minCompensation,
        maxCompensation,
        currency,
      },
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while searching jobs",
    });
  }
};
