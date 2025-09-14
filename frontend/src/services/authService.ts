import type { User } from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface AuthResponse {
  success: boolean;
  user: User;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Get user details from LinkedIn API endpoint
   */
  async getLinkedInUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/linkedin/get-user`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.user) {
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("Error fetching LinkedIn user:", error);
      return null;
    }
  }

  /**
   * Handle LinkedIn OAuth callback
   */
  async handleLinkedInCallback(code: string): Promise<LoginResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/linkedin/callback?code=${code}`,
        {
          method: "GET",
          credentials: "include", // Include cookies
        }
      );

      const data = await response.json();

      if (data.success && data.user) {
        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        user: {} as User,
        message: data.error || "Authentication failed",
      };
    } catch (error) {
      console.error("LinkedIn callback error:", error);
      return {
        success: false,
        user: {} as User,
        message: "Network error occurred",
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/linkedin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.removeToken();
    }
  }

  /**
   * Get stored token
   */
  private getToken(): string | null {
    // Try to get token from cookies first, then localStorage
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );

    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    }

    return localStorage.getItem("alumniPortalToken");
  }

  /**
   * Remove token
   */
  private removeToken(): void {
    localStorage.removeItem("alumniPortalToken");
    // Clear token cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
