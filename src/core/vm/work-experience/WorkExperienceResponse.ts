export interface WorkExperienceResponse {
  id: number;
  experienceId: string;
  userId: number;
  languageCode: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string;
  skills: string[];
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

