import type { JobPosting, JobFormData, JobType } from "../types/job";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

interface JobsResponse {
  success: boolean;
  jobs: JobPosting[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    jobsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface JobResponse {
  success: boolean;
  job: JobPosting;
  message?: string;
}

interface ApplicationResponse {
  success: boolean;
  application: any;
  message?: string;
}

interface JobApplicantsResponse {
  success: boolean;
  job: {
    id: string;
    role: string;
    company: string;
  };
  applicants: Array<{
    id: string;
    applicant: {
      id: string;
      name: string;
      email: string;
      graduationYear?: number;
      resume?: string;
      avatar: string;
    };
    appliedAt: string;
    status:
      | "pending"
      | "reviewed"
      | "accepted"
      | "rejected"
      | "shortlisted"
      | "hired";
    coverLetter?: string;
  }>;
  totalApplicants: number;
}

// Search and filter options
interface JobFilters {
  page?: number;
  limit?: number;
  type?: JobType | "all";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface JobSearchFilters extends JobFilters {
  q?: string;
  company?: string;
  workExperience?: string;
  internExperience?: string;
  minCompensation?: number;
  maxCompensation?: number;
  currency?: "INR" | "USD";
}

export const jobService = {
  // Get all job postings with optional filtering and pagination
  getAllJobs: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.type && filters.type !== "all")
        queryParams.append("type", filters.type);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams}`, {
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
      return data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw new Error("Failed to fetch jobs");
    }
  },

  // Search jobs with advanced filtering
  searchJobs: async (filters: JobSearchFilters = {}): Promise<JobsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.q) queryParams.append("q", filters.q);
      if (filters.type && filters.type !== "all")
        queryParams.append("type", filters.type);
      if (filters.company) queryParams.append("company", filters.company);
      if (filters.workExperience)
        queryParams.append("workExperience", filters.workExperience);
      if (filters.internExperience)
        queryParams.append("internExperience", filters.internExperience);
      if (filters.minCompensation)
        queryParams.append(
          "minCompensation",
          filters.minCompensation.toString()
        );
      if (filters.maxCompensation)
        queryParams.append(
          "maxCompensation",
          filters.maxCompensation.toString()
        );
      if (filters.currency) queryParams.append("currency", filters.currency);
      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const response = await fetch(
        `${API_BASE_URL}/api/jobs/search?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching jobs:", error);
      throw new Error("Failed to search jobs");
    }
  },

  // Get job by ID
  getJobById: async (id: string): Promise<JobPosting> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobResponse = await response.json();
      return data.job;
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      throw error;
    }
  },

  // Create new job posting
  createJob: async (jobData: JobFormData): Promise<JobPosting> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid job data");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobResponse = await response.json();
      return data.job;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // Delete job posting
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this job");
        }
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },

  // Apply to job
  applyToJob: async (
    jobId: string,
    applicationData: {
      coverLetter?: string;
    }
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Application failed");
        }
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApplicationResponse = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error applying to job:", error);
      throw error;
    }
  },

  // Get job applicants
  getJobApplicants: async (jobId: string): Promise<JobApplicantsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${jobId}/applicants`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          throw new Error(
            "You don't have permission to view applicants for this job"
          );
        }
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobApplicantsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching job applicants:", error);
      throw error;
    }
  },

  // Update applicant status
  updateApplicantStatus: async (
    jobId: string,
    applicationId: string,
    status: "pending" | "shortlisted" | "hired"
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${jobId}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          throw new Error(
            "You don't have permission to update applicant status for this job"
          );
        }
        if (response.status === 404) {
          throw new Error("Job or application not found");
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid status");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error updating applicant status:", error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility (now use API)
  addJob: async (
    jobData: JobFormData,
    _postedBy: string
  ): Promise<JobPosting> => {
    // The postedBy is now handled by the backend based on the authenticated user
    return await jobService.createJob(jobData);
  },

  // Legacy method - now uses API
  deleteJobAsAdmin: async (id: string): Promise<boolean> => {
    return await jobService.deleteJob(id);
  },

  // Initialize sample data (no longer needed with API)
  initializeSampleData: (): void => {
    // This method is no longer needed as data comes from the API
    console.log(
      "Sample data initialization is no longer needed with API integration"
    );
  },
};
