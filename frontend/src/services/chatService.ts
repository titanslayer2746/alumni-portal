const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper function to get auth token (same logic as authService)
const getAuthToken = (): string | null => {
  // Try to get token from cookies first, then localStorage
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );

  if (tokenCookie) {
    return tokenCookie.split("=")[1];
  }

  return localStorage.getItem("alumniPortalToken");
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response;
};

export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  }>;
  initiatedBy: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  jobId?: {
    id: string;
    role: string;
    company: string;
  };
  applicationId?: string;
  status: "active" | "closed";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: "text" | "system";
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
}

export interface CreateConversationData {
  participantIds: string[];
  jobId?: string;
  applicationId?: string;
}

export interface SendMessageData {
  content: string;
  type?: "text" | "system";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UserForConversation {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company?: string;
  position?: string;
  graduationYear?: number;
  hasExistingConversation: boolean;
}

class ChatService {
  // Create a new conversation
  async createConversation(
    data: CreateConversationData
  ): Promise<Conversation> {
    const response = await apiRequest("/api/chat/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    return responseData.conversation;
  }

  // Get user's conversations
  async getUserConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: Conversation[];
    pagination: PaginationInfo;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest(`/api/chat/conversations?${queryParams}`);
    const responseData = await response.json();
    return responseData;
  }

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<Conversation> {
    const response = await apiRequest(
      `/api/chat/conversations/${conversationId}`
    );
    const responseData = await response.json();
    return responseData.conversation;
  }

  // Get conversation messages
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: Message[];
    pagination: PaginationInfo;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await apiRequest(
      `/api/chat/conversations/${conversationId}/messages?${queryParams}`
    );
    const responseData = await response.json();
    return responseData;
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    data: SendMessageData
  ): Promise<Message> {
    console.log("chatService sendMessage called", {
      conversationId,
      data,
    });

    try {
      const response = await apiRequest(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const responseData = await response.json();
      console.log("chatService sendMessage response:", responseData);
      return responseData.data;
    } catch (error) {
      console.error("chatService sendMessage error:", error);
      throw error;
    }
  }

  // Close a conversation
  async closeConversation(conversationId: string): Promise<void> {
    await apiRequest(`/api/chat/conversations/${conversationId}/close`, {
      method: "PUT",
    });
  }

  // Create conversation from shortlisting
  async createConversationFromShortlist(data: {
    jobId: string;
    applicationId: string;
    applicantId: string;
  }): Promise<Conversation> {
    const response = await apiRequest(
      "/api/chat/conversations/initiate-from-shortlist",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const responseData = await response.json();
    return responseData.conversation;
  }

  // Get users for conversation initiation
  async getUsersForConversation(
    page: number = 1,
    limit: number = 20,
    search?: string,
    role?: string
  ): Promise<{
    users: UserForConversation[];
    pagination: PaginationInfo;
  }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) queryParams.append("search", search);
    if (role) queryParams.append("role", role);

    const response = await apiRequest(`/api/chat/users?${queryParams}`);
    const responseData = await response.json();
    return responseData;
  }
}

export const chatService = new ChatService();
