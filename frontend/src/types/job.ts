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
  postedBy: string; // alumni name
  postedAt: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
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
