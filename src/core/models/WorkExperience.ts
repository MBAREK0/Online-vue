export interface WorkExperience {
  id?: number;
  experienceId?: string;
  userId: number;
  languageCode: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  startDate: string;
  endDate?: string;
  description?: string;
  skills?: string[];
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}
