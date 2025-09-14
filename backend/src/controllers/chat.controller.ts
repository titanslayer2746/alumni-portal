import type { Request, Response } from "express";
import type { UserRole } from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

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

// Create a new conversation
export const createConversation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { participantIds, jobId, applicationId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validate required fields
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one participant is required",
      });
    }

    // Check if user can initiate conversations
    if (userRole !== "alumni" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only alumni and admin can initiate conversations",
      });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([userId, ...participantIds])];

    // Validate that all participants exist
    const participants = await User.find({ _id: { $in: allParticipants } });
    if (participants.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: "One or more participants not found",
      });
    }

    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: allParticipants },
      status: "active",
    });

    if (existingConversation) {
      return res.status(400).json({
        success: false,
        message: "Conversation already exists between these participants",
        conversationId: existingConversation._id,
      });
    }

    // Validate job and application if provided
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(400).json({
          success: false,
          message: "Job not found",
        });
      }
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: allParticipants,
      initiatedBy: userId,
      jobId: jobId || undefined,
      applicationId: applicationId || undefined,
      status: "active",
    });

    const savedConversation = await conversation.save();
    await savedConversation.populate([
      { path: "participants", select: "name email avatar role" },
      { path: "initiatedBy", select: "name email avatar role" },
      { path: "jobId", select: "role company" },
    ]);

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation: savedConversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user's conversations
export const getUserConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      status: "active",
    })
      .populate([
        { path: "participants", select: "name email avatar role" },
        { path: "initiatedBy", select: "name email avatar role" },
        { path: "jobId", select: "role company" },
      ])
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const totalConversations = await Conversation.countDocuments({
      participants: userId,
      status: "active",
    });

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const lastMessage = await Message.findOne({
            conversationId: conversation._id,
          })
            .populate("senderId", "name email avatar role")
            .sort({ createdAt: -1 })
            .limit(1);

          // Transform the message to match frontend interface
          const transformedMessage = lastMessage
            ? {
                id: lastMessage._id.toString(),
                conversationId: lastMessage.conversationId.toString(),
                content: lastMessage.content,
                type: lastMessage.type,
                isRead: lastMessage.isRead,
                readAt: lastMessage.readAt,
                createdAt: lastMessage.createdAt,
                updatedAt: lastMessage.updatedAt,
                sender: {
                  id: (lastMessage.senderId as any)._id.toString(),
                  name: (lastMessage.senderId as any).name,
                  email: (lastMessage.senderId as any).email,
                  avatar: (lastMessage.senderId as any).avatar,
                  role: (lastMessage.senderId as any).role,
                },
              }
            : null;

          // Safely transform conversation data
          const conversationData = conversation.toObject();
          return {
            id: conversation._id.toString(),
            participants: conversationData.participants,
            initiatedBy: conversationData.initiatedBy,
            jobId: conversationData.jobId,
            applicationId: conversationData.applicationId,
            status: conversationData.status,
            lastMessageAt: conversationData.lastMessageAt,
            createdAt: conversationData.createdAt,
            updatedAt: conversationData.updatedAt,
            lastMessage: transformedMessage,
          };
        } catch (conversationError) {
          console.error(
            "Error processing conversation:",
            conversation._id,
            conversationError
          );
          // Return a minimal conversation object if there's an error
          return {
            id: conversation._id.toString(),
            participants: [],
            initiatedBy: null,
            jobId: null,
            applicationId: null,
            status: "active",
            lastMessageAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            lastMessage: null,
          };
        }
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithLastMessage,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalConversations / limitNum),
        totalItems: totalConversations,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching conversations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get conversation messages
export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate("senderId", "name email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const totalMessages = await Message.countDocuments({ conversationId });

    // Mark messages as read for current user
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Transform messages to match frontend interface
    const transformedMessages = messages.reverse().map((message) => ({
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      content: message.content,
      type: message.type,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: {
        id: (message.senderId as any)._id.toString(),
        name: (message.senderId as any).name,
        email: (message.senderId as any).email,
        avatar: (message.senderId as any).avatar,
        role: (message.senderId as any).role,
      },
    }));

    res.json({
      success: true,
      messages: transformedMessages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalMessages / limitNum),
        totalMessages,
        messagesPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching messages",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, type = "text" } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      status: "active",
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Check if user can send messages
    // Students can only respond to conversations initiated by others
    if (
      userRole === "student" &&
      conversation.initiatedBy.toString() === userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Students cannot initiate conversations",
      });
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId: userId,
      content: content.trim(),
      type,
      isRead: false,
    });

    const savedMessage = await message.save();
    await savedMessage.populate("senderId", "name email avatar role");

    // Update conversation's lastMessageAt
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: savedMessage.createdAt,
    });

    // Transform message to match frontend interface
    const transformedMessage = {
      id: savedMessage._id.toString(),
      conversationId: savedMessage.conversationId.toString(),
      content: savedMessage.content,
      type: savedMessage.type,
      isRead: savedMessage.isRead,
      readAt: savedMessage.readAt,
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
      sender: {
        id: (savedMessage.senderId as any)._id.toString(),
        name: (savedMessage.senderId as any).name,
        email: (savedMessage.senderId as any).email,
        avatar: (savedMessage.senderId as any).avatar,
        role: (savedMessage.senderId as any).role,
      },
    };

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: transformedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while sending message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Close a conversation
export const closeConversation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Check if user can close conversation
    // Only alumni, admin, or the person who initiated can close
    const canClose =
      userRole === "admin" ||
      userRole === "alumni" ||
      conversation.initiatedBy.toString() === userId;

    if (!canClose) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to close this conversation",
      });
    }

    // Update conversation status
    conversation.status = "closed";
    await conversation.save();

    res.json({
      success: true,
      message: "Conversation closed successfully",
    });
  } catch (error) {
    console.error("Error closing conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while closing conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create conversation from shortlisting
export const createConversationFromShortlist = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { jobId, applicationId, applicantId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validate required fields
    if (!jobId || !applicationId || !applicantId) {
      return res.status(400).json({
        success: false,
        message: "Job ID, application ID, and applicant ID are required",
      });
    }

    // Check if user can initiate conversations
    if (userRole !== "alumni" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only alumni and admin can initiate conversations",
      });
    }

    // Verify job exists and user has permission
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to shortlist for this job",
      });
    }

    // Verify applicant exists
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found",
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, applicantId] },
      jobId,
      status: "active",
    });

    if (existingConversation) {
      return res.status(400).json({
        success: false,
        message: "Conversation already exists for this shortlisting",
        conversationId: existingConversation._id,
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, applicantId],
      initiatedBy: userId,
      jobId,
      applicationId,
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

    // Populate conversation data
    await savedConversation.populate([
      { path: "participants", select: "name email avatar role" },
      { path: "initiatedBy", select: "name email avatar role" },
      { path: "jobId", select: "role company" },
    ]);

    res.status(201).json({
      success: true,
      message: "Conversation created and system message sent",
      conversation: savedConversation,
    });
  } catch (error) {
    console.error("Error creating conversation from shortlist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get conversation by ID
export const getConversationById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate([
      { path: "participants", select: "name email avatar role" },
      { path: "initiatedBy", select: "name email avatar role" },
      { path: "jobId", select: "role company" },
    ]);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get users for conversation initiation
export const getUsersForConversation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { search, role, page = 1, limit = 20 } = req.query;

    // Check if user can initiate conversations
    if (userRole !== "alumni" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only alumni and admin can initiate conversations",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {
      _id: { $ne: userId }, // Exclude current user
      status: "active", // Only active users
    };

    // Add role filter if specified
    if (role && role !== "all") {
      filter.role = role;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select("name email avatar role company position graduationYear")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const totalUsers = await User.countDocuments(filter);

    // Check which users already have conversations with current user
    const userIds = users.map((user) => user._id);
    const existingConversations = await Conversation.find({
      participants: { $all: [userId, ...userIds] },
      status: "active",
    }).select("participants");

    const existingUserIds = new Set();
    existingConversations.forEach((conv) => {
      conv.participants.forEach((participant) => {
        if (participant.toString() !== userId) {
          existingUserIds.add(participant.toString());
        }
      });
    });

    // Add conversation status to users
    const usersWithConversationStatus = users.map((user) => ({
      ...user.toJSON(),
      hasExistingConversation: existingUserIds.has(user._id.toString()),
    }));

    res.json({
      success: true,
      users: usersWithConversationStatus,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        usersPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching users for conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
