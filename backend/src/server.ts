import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./config/database.js";
import AuthRoutes from "./routes/auth.route.js";
import JobRoutes from "./routes/job.route.js";
import AdminRoutes from "./routes/admin.route.js";
import ChatRoutes from "./routes/chat.route.js";
import ImageProxyRoutes from "./routes/image-proxy.route.js";
import ChatWebSocket from "./websocket/chatWebSocket.js";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/linkedin", AuthRoutes);
app.use("/api/jobs", JobRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/proxy", ImageProxyRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Alumni Portal Backend Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Initialize WebSocket
let chatWebSocket: ChatWebSocket;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize WebSocket
    chatWebSocket = new ChatWebSocket(server);

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Alumni Portal Backend Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket server initialized for real-time chat`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
