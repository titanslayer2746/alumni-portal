export type JobType = "intern" | "intern+ppo" | "fulltime";
export type Currency = "INR" | "USD";

export interface JobPosting {
  id: string;
  role: string;
  company: string;
  type: JobType;
  workExperience: string;
  internExperience: string;
  duration: string;
  compensation: {
    amount: string;
    currency: Currency;
  };
  postedBy:
    | string
    | { _id: string; name: string; email: string; avatar: string }; // alumni name or populated user object
  postedAt: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  hasApplied?: boolean;
  applicationStatus?:
    | "pending"
    | "reviewed"
    | "accepted"
    | "rejected"
    | "shortlisted"
    | "hired";
}

export interface JobFormData {
  role: string;
  company: string;
  type: JobType;
  workExperience: string;
  internExperience: string;
  duration: string;
  compensation: {
    amount: string;
    currency: Currency;
  };
  description: string;
  requirements: string[];
  benefits: string[];
}
