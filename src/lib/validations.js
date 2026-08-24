import { z } from "zod";

// Article statuses as constants
export const ARTICLE_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  RESUBMITTED: "RESUBMITTED",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
};

// Valid status transitions
export const STATUS_TRANSITIONS = {
  [ARTICLE_STATUS.DRAFT]: [ARTICLE_STATUS.SUBMITTED],
  [ARTICLE_STATUS.SUBMITTED]: [ARTICLE_STATUS.IN_REVIEW],
  [ARTICLE_STATUS.IN_REVIEW]: [
    ARTICLE_STATUS.REVISION_REQUESTED,
    ARTICLE_STATUS.APPROVED,
    ARTICLE_STATUS.REJECTED,
  ],
  [ARTICLE_STATUS.REVISION_REQUESTED]: [ARTICLE_STATUS.RESUBMITTED],
  [ARTICLE_STATUS.RESUBMITTED]: [ARTICLE_STATUS.IN_REVIEW],
  [ARTICLE_STATUS.APPROVED]: [ARTICLE_STATUS.PUBLISHED],
  [ARTICLE_STATUS.PUBLISHED]: [ARTICLE_STATUS.ARCHIVED],
  [ARTICLE_STATUS.REJECTED]: [ARTICLE_STATUS.DRAFT],
  [ARTICLE_STATUS.ARCHIVED]: [],
};

// User roles
export const USER_ROLES = {
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
  coverImage: z
    .object({
      url: z.string().url("Invalid image URL").optional().default(""),
      alt: z.string().optional().default(""),
    })
    .optional()
    .default({ url: "", alt: "" }),
  isTopNews: z.boolean().optional().default(false),
});

// Article update schema (all fields optional)
export const articleUpdateSchema = articleSchema.partial();

// Comment schema
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
  articleId: z.string().min(1, "Article ID is required"),
  selectedText: z.string().optional().default(""), // Future: inline text selection
  parentId: z.string().optional(), // Future: reply threading
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
    stats: {
      views: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}
