import type { JobPosting, JobFormData } from "../types/job";

const JOBS_STORAGE_KEY = "alumniPortalJobs";

export const jobService = {
  // Get all job postings
  getAllJobs: (): JobPosting[] => {
    const jobs = localStorage.getItem(JOBS_STORAGE_KEY);
    return jobs ? JSON.parse(jobs) : [];
  },

  // Add a new job posting
  addJob: (jobData: JobFormData, postedBy: string): JobPosting => {
    const jobs = jobService.getAllJobs();
    const newJob: JobPosting = {
      id: Date.now().toString(),
      ...jobData,
      postedBy,
      postedAt: new Date().toISOString(),
    };

    const updatedJobs = [newJob, ...jobs];
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
    return newJob;
  },

  // Get job by ID
  getJobById: (id: string): JobPosting | undefined => {
    const jobs = jobService.getAllJobs();
    return jobs.find((job) => job.id === id);
  },

  // Delete job (for alumni who posted it)
  deleteJob: (id: string, postedBy: string): boolean => {
    const jobs = jobService.getAllJobs();
    const jobIndex = jobs.findIndex(
      (job) => job.id === id && job.postedBy === postedBy
    );

    if (jobIndex !== -1) {
      jobs.splice(jobIndex, 1);
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      return true;
    }
    return false;
  },

  // Delete job (for admin - can delete any job)
  deleteJobAsAdmin: (id: string): boolean => {
    const jobs = jobService.getAllJobs();
    const jobIndex = jobs.findIndex((job) => job.id === id);

    if (jobIndex !== -1) {
      jobs.splice(jobIndex, 1);
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      return true;
    }
    return false;
  },

  // Initialize with sample data
  initializeSampleData: (): void => {
    const existingJobs = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!existingJobs) {
      const sampleJobs: JobPosting[] = [
        {
          id: "1",
          role: "Software Engineer Intern",
          company: "TechCorp",
          type: "intern",
          workExperience: "0-1 years",
          internExperience: "0-6 months",
          duration: "6 months",
          compensation: {
            amount: "25000",
            currency: "INR",
          },
          postedBy: "John Doe",
          postedAt: new Date(Date.now() - 86400000).toISOString(),
          description:
            "Join our dynamic team as a Software Engineer Intern and work on cutting-edge projects.",
          requirements: [
            "Basic programming knowledge",
            "Enthusiasm to learn",
            "Good communication skills",
          ],
          benefits: [
            "Mentorship program",
            "Flexible working hours",
            "Certificate of completion",
          ],
        },
        {
          id: "2",
          role: "Full Stack Developer",
          company: "StartupXYZ",
          type: "fulltime",
          workExperience: "1-3 years",
          internExperience: "6+ months",
          duration: "Full-time",
          compensation: {
            amount: "800000",
            currency: "INR",
          },
          postedBy: "Jane Smith",
          postedAt: new Date(Date.now() - 172800000).toISOString(),
          description:
            "We are looking for a passionate Full Stack Developer to join our growing team.",
          requirements: [
            "React/Node.js experience",
            "Database knowledge",
            "Problem-solving skills",
          ],
          benefits: [
            "Health insurance",
            "Stock options",
            "Remote work flexibility",
          ],
        },
      ];
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(sampleJobs));
    }
  },
};
