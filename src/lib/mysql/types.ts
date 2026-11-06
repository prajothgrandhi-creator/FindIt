export type ReportStatus = "open" | "resolved" | "closed";
export type ReportType = "lost" | "found";

export type ReportView = {
  id: string;
  ownerId: string;
  type: ReportType;
  itemName: string;
  description: string;
  location: string;
  occurredAt: string | null;
  hasImage: boolean;
  imageMime: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};
