import type {
  AdminUser,
  UserRole,
  UserFilters,
  PaginationInfo,
} from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const USERS_STORAGE_KEY = "alumniPortalUsers";
const ITEMS_PER_PAGE = 10;

// Initialize with some sample data if no users exist
const initializeSampleUsers = (): AdminUser[] => {
  const sampleUsers: AdminUser[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "pending",
      graduationYear: 2020,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      company: "Tech Corp",
      position: "Software Engineer",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "alumni",
      graduationYear: 2019,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      company: "Google",
      position: "Senior Developer",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "student",
      graduationYear: 2024,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: "active",
    },
  ];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sampleUsers));
  return sampleUsers;
};

export const getUserService = () => {
  const getUsers = (): AdminUser[] => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    if (!users) {
      return initializeSampleUsers();
    }
    return JSON.parse(users);
  };

  const saveUsers = (users: AdminUser[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const getUsersWithPagination = (
    page: number = 1,
    filters: UserFilters = {}
  ): { users: AdminUser[]; pagination: PaginationInfo } => {
    let allUsers = getUsers();

    // Apply filters
    if (filters.role) {
      allUsers = allUsers.filter((user) => user.role === filters.role);
    }
    if (filters.status) {
      allUsers = allUsers.filter((user) => user.status === filters.status);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      allUsers = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.company?.toLowerCase().includes(searchTerm) ||
          user.position?.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalItems = allUsers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    };
  };

  const deleteUser = (userId: string): boolean => {
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return false;

    users[userIndex].status = "deleted";
    saveUsers(users);
    return true;
  };

  const updateUserRole = (userId: string, role: UserRole): boolean => {
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return false;

    users[userIndex].role = role;
    saveUsers(users);
    return true;
  };

  const addUser = (
    userData: Omit<AdminUser, "id" | "createdAt" | "status">
  ): AdminUser => {
    const users = getUsers();
    const newUser: AdminUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: "active",
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  };

  const getUserById = (userId: string): AdminUser | null => {
    const users = getUsers();
    return users.find((user) => user.id === userId) || null;
  };

  // API-based methods for backend integration
  const getUsersFromAPI = async (): Promise<AdminUser[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("Error fetching users from API:", error);
      // Fallback to local storage
      return getUsers();
    }
  };

  const getUsersWithPaginationFromAPI = async (
    page: number = 1,
    filters: UserFilters = {}
  ): Promise<{ users: AdminUser[]; pagination: PaginationInfo }> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        users: data.users || [],
        pagination: data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
        },
      };
    } catch (error) {
      console.error("Error fetching users with pagination from API:", error);
      // Fallback to local storage
      return getUsersWithPagination(page, filters);
    }
  };

  const updateUserRoleFromAPI = async (
    userId: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error updating user role via API:", error);
      // Fallback to local storage
      return updateUserRole(userId, role);
    }
  };

  const deleteUserFromAPI = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting user via API:", error);
      // Fallback to local storage
      return deleteUser(userId);
    }
  };

  const getUserByIdFromAPI = async (
    userId: string
  ): Promise<AdminUser | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("Error fetching user by ID via API:", error);
      // Fallback to local storage
      return getUserById(userId);
    }
  };

  return {
    // Local storage methods (fallback)
    getUsers,
    getUsersWithPagination,
    deleteUser,
    updateUserRole,
    addUser,
    getUserById,

    // API methods (primary)
    getUsersFromAPI,
    getUsersWithPaginationFromAPI,
    updateUserRoleFromAPI,
    deleteUserFromAPI,
    getUserByIdFromAPI,
  };
};
