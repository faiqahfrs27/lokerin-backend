export interface CvExperience {
  company: string;
  position: string;
  startYear: string;
  endYear?: string;
  description?: string;
}

export interface CvEducation {
  institution: string;
  degree: string;
  major: string;
  startYear: string;
  endYear?: string;
  gpa?: string;
}

export interface CvData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  portfolioUrl?: string;
  summary?: string;
  experiences: CvExperience[];
  educations: CvEducation[];
  additionalSkills: string[];
  verifiedSkills: string[];
}

// PDF layout constants
export const C = {
  brand: "#F97316",
  black: "#1C1917",
  gray: "#57534E",
  lightGray: "#A8A29E",
  divider: "#D6D3D1",
};

export const FONT_BOLD = "Helvetica-Bold";
export const FONT_REGULAR = "Helvetica";
export const PAGE_MARGIN = 50;
export const CONTENT_WIDTH = 495;
