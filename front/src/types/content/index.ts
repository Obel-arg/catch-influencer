export interface Content {
  id: string;
  title: string;
  description: string;
  type: "post" | "story" | "reel" | "video" | "article";
  platform: string;
  status: "draft" | "scheduled" | "published" | "archived";
  content: {
    text?: string;
    media?: string[];
    links?: string[];
  };
  metadata: {
    tags: string[];
    categories: string[];
    language: string;
    targetAudience?: string[];
  };
  schedule?: {
    publishDate: Date;
    expireDate?: Date;
  };
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: Content["type"];
  platform: string;
  content: {
    text?: string;
    media?: string[];
    links?: string[];
  };
  metadata: {
    tags: string[];
    categories: string[];
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSchedule {
  id: string;
  contentId: string;
  publishDate: Date;
  expireDate?: Date;
  status: "pending" | "published" | "expired" | "cancelled";
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContentDto = Omit<Content, "id" | "createdAt" | "updatedAt" | "metrics">;

export type UpdateContentDto = Partial<Omit<Content, "id" | "createdAt" | "updatedAt" | "metrics">>;

export interface ContentFilters {
  type?: Content["type"];
  platform?: string;
  status?: Content["status"];
  search?: string;
  tags?: string[];
  categories?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} 