import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

interface AuthenticatedSocket {
  userId: string;
  userRole: UserRole;
  userName: string;
  userEmail: string;
}

interface ServerToClientEvents {
  message: (message: any) => void;
  conversationUpdate: (conversation: any) => void;
  userTyping: (data: {
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
  error: (error: string) => void;
}

interface ClientToServerEvents {
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type?: string;
  }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

export class ChatWebSocket {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents
  >;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Store user info in socket
        (socket as any).user = {
          userId: decoded.id,
          userRole: decoded.role,
          userName: decoded.name,
          userEmail: decoded.email,
        };

        next();
      } catch (error) {
        console.error("WebSocket authentication error:", error);
        next(new Error("Invalid authentication token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const user = (socket as any).user as AuthenticatedSocket;

      // User connected to chat

      // Store user connection
      this.connectedUsers.set(socket.id, user);
      this.userSockets.set(user.userId, socket.id);

      // Join user to their personal room for notifications
      socket.join(`user:${user.userId}`);

      // Handle joining a conversation
      socket.on("joinConversation", async (conversationId) => {
        try {
          // Verify user is participant in conversation
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: user.userId,
            status: "active",
          });

          if (!conversation) {
            socket.emit("error", "Conversation not found or access denied");
            return;
          }

          // Join conversation room
          socket.join(`conversation:${conversationId}`);
          // User joined conversation
        } catch (error) {
          console.error("Error joining conversation:", error);
          socket.emit("error", "Failed to join conversation");
        }
      });

      // Handle leaving a conversation
      socket.on("leaveConversation", (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        // User left conversation
      });

      // Handle sending messages
      socket.on("sendMessage", async (data) => {
        try {
          const { conversationId, content, type = "text" } = data;

          // Verify user is participant in conversation
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: user.userId,
            status: "active",
          });

          if (!conversation) {
            socket.emit("error", "Conversation not found or access denied");
            return;
          }

          // Check if user can send messages
          if (
            user.userRole === "student" &&
            conversation.initiatedBy.toString() === user.userId
          ) {
            socket.emit("error", "Students cannot initiate conversations");
            return;
          }

          // Create and save message
          const message = new Message({
            conversationId,
            senderId: user.userId,
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

          // Broadcast message to all participants in the conversation
          this.io.to(`conversation:${conversationId}`).emit("message", {
            id: savedMessage._id,
            conversationId: savedMessage.conversationId,
            content: savedMessage.content,
            type: savedMessage.type,
            isRead: savedMessage.isRead,
            createdAt: savedMessage.createdAt,
            sender: {
              id: (savedMessage.senderId as any)._id,
              name: (savedMessage.senderId as any).name,
              email: (savedMessage.senderId as any).email,
              avatar: (savedMessage.senderId as any).avatar,
              role: (savedMessage.senderId as any).role,
            },
          });

          // Notify participants who are not in the conversation room
          const participants = conversation.participants.filter(
            (p) => p.toString() !== user.userId
          );
          for (const participantId of participants) {
            const participantSocketId = this.userSockets.get(
              participantId.toString()
            );
            if (participantSocketId) {
              this.io.to(participantSocketId).emit("conversationUpdate", {
                conversationId,
                lastMessage: {
                  content: savedMessage.content,
                  createdAt: savedMessage.createdAt,
                  sender: {
                    name: (savedMessage.senderId as any).name,
                  },
                },
              });
            }
          }
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      });

      // Handle typing indicators
      socket.on("typing", (data) => {
        const { conversationId, isTyping } = data;

        // Broadcast typing status to other participants in the conversation
        socket.to(`conversation:${conversationId}`).emit("userTyping", {
          userId: user.userId,
          userName: user.userName,
          isTyping,
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        // User disconnected from chat
        this.connectedUsers.delete(socket.id);
        this.userSockets.delete(user.userId);
      });
    });
  }

  // Method to send notification to specific user
  public sendNotificationToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event as any, data);
    }
  }

  // Method to broadcast to conversation
  public broadcastToConversation(
    conversationId: string,
    event: string,
    data: any
  ) {
    this.io.to(`conversation:${conversationId}`).emit(event as any, data);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get user's socket ID
  public getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }
}

export default ChatWebSocket;
