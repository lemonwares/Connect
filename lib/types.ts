export type Industry =
  | "PASTOR"
  | "ENTREPRENEUR"
  | "DOCTOR"
  | "ENGINEER"
  | "LAWYER"
  | "EDUCATOR"
  | "FINANCE"
  | "TECH"
  | "CREATIVE"
  | "REAL_ESTATE"
  | "HEALTHCARE"
  | "MEDIA"
  | "OTHER";

export interface Profile {
  id: string;
  name: string;
  photo: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  stateOfOrigin: string | null;
  area: string | null;
  sex: string | null;
  genotype: string | null;
  lookingFor: string | null;
  jobTitle: string | null;
  company: string | null;
  industry: Industry | null;
  contactLink: string | null;
  funFact?: string | null;
  createdAt: string;
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  PASTOR: "Pastor",
  ENTREPRENEUR: "Entrepreneur",
  DOCTOR: "Doctor",
  ENGINEER: "Engineer",
  LAWYER: "Lawyer",
  EDUCATOR: "Educator",
  FINANCE: "Finance",
  TECH: "Tech",
  CREATIVE: "Creative",
  REAL_ESTATE: "Real Estate",
  HEALTHCARE: "Healthcare",
  MEDIA: "Media",
  OTHER: "Other",
};
