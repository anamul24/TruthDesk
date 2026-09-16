import { z } from "zod";

// Article statuses as constants
export const ARTICLE_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  NEEDS_CHANGES: "NEEDS_CHANGES",
  FACT_CHECK: "FACT_CHECK",
  APPROVED: "APPROVED",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
  CORRECTED: "CORRECTED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
};

// Valid status transitions
export const STATUS_TRANSITIONS = {
  [ARTICLE_STATUS.DRAFT]: [ARTICLE_STATUS.SUBMITTED],
  [ARTICLE_STATUS.SUBMITTED]: [ARTICLE_STATUS.IN_REVIEW],
  [ARTICLE_STATUS.IN_REVIEW]: [
    ARTICLE_STATUS.NEEDS_CHANGES,
    ARTICLE_STATUS.FACT_CHECK,
    ARTICLE_STATUS.APPROVED,
    ARTICLE_STATUS.REJECTED,
  ],
  [ARTICLE_STATUS.NEEDS_CHANGES]: [ARTICLE_STATUS.SUBMITTED],
  [ARTICLE_STATUS.FACT_CHECK]: [ARTICLE_STATUS.APPROVED, ARTICLE_STATUS.NEEDS_CHANGES],
  [ARTICLE_STATUS.APPROVED]: [ARTICLE_STATUS.SCHEDULED, ARTICLE_STATUS.PUBLISHED],
  [ARTICLE_STATUS.SCHEDULED]: [ARTICLE_STATUS.PUBLISHED, ARTICLE_STATUS.DRAFT],
  [ARTICLE_STATUS.PUBLISHED]: [ARTICLE_STATUS.CORRECTED, ARTICLE_STATUS.ARCHIVED],
  [ARTICLE_STATUS.CORRECTED]: [ARTICLE_STATUS.ARCHIVED],
  [ARTICLE_STATUS.REJECTED]: [ARTICLE_STATUS.DRAFT],
  [ARTICLE_STATUS.ARCHIVED]: [],
};

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  EDITOR: "editor",
  JOURNALIST: "journalist",
  FACT_CHECKER: "fact_checker",
};

// Article validation schema
export const articleSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(300, "Title must be less than 300 characters"),
  subtitle: z
    .string()
    .max(500, "Subtitle must be less than 500 characters")
    .optional()
    .default(""),
  excerpt: z
    .string()
    .max(1000, "Excerpt must be less than 1000 characters")
    .optional()
    .default(""),
  content: z.any(), // Tiptap JSON content
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  language: z.enum(["en", "bn", "both"]).optional().default("en"),
  coverImage: z
    .object({
      url: z.string().url("Invalid image URL").optional().default(""),
      alt: z.string().optional().default(""),
    })
    .optional()
    .default({ url: "", alt: "" }),
  isTopNews: z.boolean().optional().default(false),
  seo: z.object({
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
    slug: z.string().optional().default(""),
    canonical: z.string().url().optional().or(z.literal("")),
  }).optional(),
  readingTime: z.number().optional().default(0),
  wordCount: z.number().optional().default(0),
  lockedBy: z.string().nullable().optional().default(null),
  lockedAt: z.date().nullable().optional().default(null),
});

// Article update schema (all fields optional)
export const articleUpdateSchema = articleSchema.partial();

// Public Comment schema (from before)
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
  articleId: z.string().min(1, "Article ID is required"),
  selectedText: z.string().optional().default(""), // Future: inline text selection
  parentId: z.string().optional(), // Future: reply threading
});

// Editor Inline Comment Schema
export const editorCommentSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  editorId: z.string().min(1, "Editor ID is required"),
  editorName: z.string(),
  content: z.string().min(1, "Comment is required"),
  selectedText: z.string().optional(),
  section: z.string().optional(), // e.g. "headline", "body", "media"
  status: z.enum(["OPEN", "RESOLVED"]).default("OPEN"),
  createdAt: z.date().or(z.string()),
});

// Article Revision Schema
export const articleRevisionSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  version: z.number().min(1),
  content: z.any(), // Snapshot of the article content
  title: z.string(),
  changedBy: z.string(), // ID of the user who made the change
  changeSummary: z.string().optional(),
  createdAt: z.date().or(z.string()),
});

// Revision request schema
export const revisionRequestSchema = z.object({
  comment: z
    .string()
    .min(1, "Revision comment is required")
    .max(5000, "Comment is too long"),
});

// Reject schema
export const rejectSchema = z.object({
  reason: z
    .string()
    .min(1, "Rejection reason is required")
    .max(5000, "Reason is too long"),
});

// Category schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional().default(""),
});

// User profile schema
export const userProfileSchema = z.object({
  bio: z.string().max(1000).optional().default(""),
  designation: z.string().max(100).optional().default(""),
  department: z.string().max(100).optional().default(""),
});

// Assignment Schema
export const assignmentSchema = z.object({
  title: z.string().min(5, "Title is required").max(200),
  description: z.string().min(10, "Description is required"),
  journalistId: z.string().min(1, "Journalist is required"),
  editorId: z.string().min(1, "Editor is required"),
  categoryId: z.string().min(1, "Category is required"),
  priority: z.enum(["NORMAL", "URGENT", "BREAKING"]).default("NORMAL"),
  deadline: z.string().datetime().or(z.date()),
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "CANCELLED"]).default("ASSIGNED"),
  attachments: z.array(z.string().url()).optional().default([]),
});

// Pitch Schema
export const pitchSchema = z.object({
  title: z.string().min(5, "Title is required").max(200),
  description: z.string().min(20, "Please provide more details for the pitch"),
  journalistId: z.string().min(1, "Journalist is required"),
  categoryId: z.string().min(1, "Category is required"),
  urgency: z.enum(["NORMAL", "HIGH", "BREAKING"]).default("NORMAL"),
  expectedTime: z.string().optional(),
  sources: z.array(z.string()).optional().default([]),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFO", "APPROVED", "REJECTED"]).default("SUBMITTED"),
});

// Source Schema
export const sourceSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  title: z.string().min(1, "Source title is required"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sourceType: z.string().default("General"),
  quote: z.string().optional(),
  note: z.string().optional(),
  verificationStatus: z.enum(["UNVERIFIED", "NEEDS_VERIFICATION", "SOURCE_VERIFIED", "FACT_CHECKED"]).default("UNVERIFIED"),
});

// Media Schema
export const mediaSchema = z.object({
  filename: z.string(),
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"]),
  uploaderId: z.string(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

// Breaking News Schema
export const breakingNewsSchema = z.object({
  headline: z.string().min(5, "Headline is required").max(150),
  articleId: z.string().optional(),
  link: z.string().optional(),
  priority: z.enum(["HIGH", "CRITICAL"]).default("HIGH"),
  isActive: z.boolean().default(true),
  startTime: z.date().or(z.string()),
  expiryTime: z.date().or(z.string()),
  createdBy: z.string(),
});

// Homepage Layout Schema
export const homepageLayoutSchema = z.object({
  version: z.number().default(1),
  heroStoryId: z.string().nullable().optional(),
  topNewsIds: z.array(z.string()).default([]),
  mustReadIds: z.array(z.string()).default([]),
  latestNewsOrder: z.enum(["CHRONOLOGICAL", "CURATED"]).default("CHRONOLOGICAL"),
  curatedLatestIds: z.array(z.string()).default([]),
  categoryHighlights: z.record(z.array(z.string())).default({}), // e.g. { "sports": ["id1", "id2"] }
  updatedBy: z.string(),
  updatedAt: z.date().or(z.string()),
});

// Publishing Pipeline Status Schema
export const publishingPipelineSchema = z.object({
  articleId: z.string(),
  channel: z.enum(["WEBSITE", "FACEBOOK", "TELEGRAM", "WHATSAPP", "X"]),
  status: z.enum(["QUEUED", "PUBLISHING", "PUBLISHED", "FAILED", "RETRYING"]),
  publishedUrl: z.string().optional(),
  errorMessage: z.string().optional(),
  updatedAt: z.date().or(z.string()),
});

// Audit Log Schema
export const auditLogSchema = z.object({
  action: z.string(),
  targetId: z.string().optional(),
  targetType: z.string().optional(), // "ARTICLE", "USER", "ROLE", "SETTING"
  userId: z.string(),
  userRole: z.string(),
  userName: z.string(),
  context: z.any().optional(), // Additional details
  createdAt: z.date().or(z.string()),
});

// Settings Schema
export const userSettingsSchema = z.object({
  type: z.enum(["GENERAL", "EDITORIAL", "NOTIFICATIONS", "SECURITY"]),
  config: z.any(), // Flexible config object depending on type
  updatedBy: z.string(),
  updatedAt: z.date().or(z.string()),
});

// Ad Slot Schema
export const adSlotSchema = z.object({
  name: z.string(),
  placement: z.enum(["HOMEPAGE", "ARTICLE", "CATEGORY", "SIDEBAR", "BETWEEN_STORIES"]),
  type: z.enum(["ADSENSE", "SPONSORED", "NATIVE"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SCHEDULED"]).default("INACTIVE"),
  config: z.any().optional(), // Script tags, HTML, etc.
  scheduleStart: z.date().or(z.string()).optional(),
  scheduleEnd: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
});

// Helper: Check if a status transition is valid
export function isValidTransition(currentStatus, newStatus) {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

// Helper: Create new article document
export function createArticleDocument({
  title,
  slug,
  subtitle = "",
  excerpt = "",
  content = null,
  categoryId,
  tags = [],
  coverImage = { url: "", alt: "" },
  authorId,
  authorName = "",
  status = ARTICLE_STATUS.DRAFT,
  isTopNews = false,
}) {
  const now = new Date();
  return {
    title,
    slug,
    subtitle,
    excerpt,
    content,
    categoryId,
    tags,
    coverImage,
    authorId,
    authorName,
    status,
    workflow: {
      submittedAt: null,
      reviewedAt: null,
      publishedAt: null,
      reviewedBy: null,
    },
    revision: {
      version: 1,
      requestedBy: null,
      requestedAt: null,
      comment: null,
    },
    editorial: {
      editorNotes: "",
      factChecked: false,
      featured: false,
      trending: false,
      todaysPick: false,
      topNews: isTopNews,
    },
    seo: {
      title: "",
      description: "",
      slug: slug,
      canonical: "",
    },
    language: "en",
    readingTime: 0,
    wordCount: 0,
    stats: {
      views: 0,
    },
    lockedBy: null,
    lockedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
