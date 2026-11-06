export type UniversityDocument = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentRosterDocument = {
  universityId: string;
  normalizedSrn: string;
  authEmail: string;
  isActive: boolean;
  createdAt: Date;
};

export type StudentProfileDocument = {
  _id: string;
  universityId: string;
  normalizedSrn: string;
  displayName: string;
  email: string;
  passwordHash: string;
  verificationStatus: "pending" | "verified" | "disabled";
  role: "student" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type SessionDocument = {
  _id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};
