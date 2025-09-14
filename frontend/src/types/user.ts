export type UserRole = "pending" | "admin" | "alumni" | "student";

export interface User {
  id: string;
  name: string; // required
  email: string; // required
  graduationYear?: number; // optional
  avatar: string; // required
  role: UserRole; // pending (default), admin, alumni, student
  company?: string; // optional
  position?: string; // optional
  resume?: string; // optional - drive link to resume
  createdAt: string; // required
  updatedAt?: string; // optional
}

export interface AdminUser extends User {
  status: "active" | "deleted";
}

export interface UserFilters {
  role?: UserRole;
  status?: "active" | "deleted";
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
