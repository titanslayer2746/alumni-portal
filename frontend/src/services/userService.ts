import type {
  AdminUser,
  UserRole,
  UserFilters,
  PaginationInfo,
} from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const ITEMS_PER_PAGE = 10;

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
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

export const getUserService = () => {
  // Get users with pagination and filtering
  const getUsersWithPagination = async (
    page: number = 1,
    filters: UserFilters = {}
  ): Promise<{ users: AdminUser[]; pagination: PaginationInfo }> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      // Add filters to query params
      if (filters.role) queryParams.append("role", filters.role);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await apiRequest(`/api/admin/users?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        return {
          users: data.data.users,
          pagination: data.data.pagination,
        };
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  // Get user by ID
  const getUserById = async (userId: string): Promise<AdminUser> => {
    try {
      const response = await apiRequest(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  // Update user role
  const updateUserRole = async (
    userId: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      console.log("Making API request to update role:", {
        userId,
        role,
        endpoint: `/api/admin/users/${userId}/role`,
      });

      const response = await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      console.log("API response:", data);
      return data.success;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  };

  // Update user status (soft delete/restore)
  const updateUserStatus = async (
    userId: string,
    status: "active" | "deleted"
  ): Promise<boolean> => {
    try {
      const response = await apiRequest(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  };

  // Update user profile
  const updateUserProfile = async (
    userId: string,
    profileData: Partial<AdminUser>
  ): Promise<boolean> => {
    try {
      const response = await apiRequest(`/api/admin/users/${userId}/profile`, {
        method: "PATCH",
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  };

  // Delete user (soft delete)
  const deleteUser = async (userId: string): Promise<boolean> => {
    return updateUserStatus(userId, "deleted");
  };

  // Restore user
  const restoreUser = async (userId: string): Promise<boolean> => {
    return updateUserStatus(userId, "active");
  };

  // Get dashboard statistics
  const getDashboardStats = async () => {
    try {
      const response = await apiRequest("/api/admin/dashboard/stats");
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  };

  return {
    getUsersWithPagination,
    getUserById,
    updateUserRole,
    updateUserStatus,
    updateUserProfile,
    deleteUser,
    restoreUser,
    getDashboardStats,
  };
};
