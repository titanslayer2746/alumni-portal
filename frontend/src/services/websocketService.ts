import { io, Socket } from "socket.io-client";
import type { Message, Conversation } from "./chatService";

export interface WebSocketEvents {
  message: (message: Message) => void;
  conversationUpdate: (conversation: Conversation) => void;
  userTyping: (data: {
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
  error: (error: string) => void;
}

export interface WebSocketClientEvents {
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type?: string;
  }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Initialize WebSocket connection
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(import.meta.env.VITE_API_URL, {
          auth: {
            token,
          },
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("WebSocket connected");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
          this.isConnected = false;

          if (reason === "io server disconnect") {
            // Server disconnected, try to reconnect
            this.handleReconnect();
          }
        });

        this.socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          this.isConnected = false;
          this.handleReconnect();
          reject(error);
        });

        // Set up event listeners
        this.setupEventListeners();
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Join a conversation room
  joinConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("joinConversation", conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("leaveConversation", conversationId);
    }
  }

  // Send a message
  sendMessage(
    conversationId: string,
    content: string,
    type: string = "text"
  ): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("sendMessage", {
        conversationId,
        content,
        type,
      });
    }
  }

  // Send typing indicator
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", {
        conversationId,
        isTyping,
      });
    }
  }

  // Set up event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Message received
    this.socket.on("message", (message: Message) => {
      // Emit custom event for components to listen to
      window.dispatchEvent(
        new CustomEvent("websocket:message", { detail: message })
      );
    });

    // Conversation update
    this.socket.on("conversationUpdate", (conversation: Conversation) => {
      window.dispatchEvent(
        new CustomEvent("websocket:conversationUpdate", {
          detail: conversation,
        })
      );
    });

    // User typing
    this.socket.on(
      "userTyping",
      (data: { userId: string; userName: string; isTyping: boolean }) => {
        window.dispatchEvent(
          new CustomEvent("websocket:userTyping", { detail: data })
        );
      }
    );

    // Error
    this.socket.on("error", (error: string) => {
      console.error("WebSocket error:", error);
      window.dispatchEvent(
        new CustomEvent("websocket:error", { detail: error })
      );
    });
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  // Add event listener for custom events
  addEventListener(event: string, callback: (data: any) => void): void {
    window.addEventListener(event, callback);
  }

  // Remove event listener
  removeEventListener(event: string, callback: (data: any) => void): void {
    window.removeEventListener(event, callback);
  }
}

export const websocketService = new WebSocketService();
