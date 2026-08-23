import { getCollection, COLLECTIONS } from "./db";

/**
 * Log an audit event to the auditLogs collection.
 *
 * @param {Object} params
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.userName - Name of the user
 * @param {string} params.action - Action performed (e.g., 'article.submitted', 'article.approved')
 * @param {string} [params.articleId] - Related article ID
 * @param {string} [params.articleTitle] - Related article title
 * @param {string} [params.previousStatus] - Previous article status
 * @param {string} [params.newStatus] - New article status
 * @param {Object} [params.metadata] - Additional metadata
 */
export async function logAuditEvent({
  userId,
  userName,
  action,
  articleId = null,
  articleTitle = null,
  previousStatus = null,
  newStatus = null,
  metadata = {},
}) {
  try {
    const collection = await getCollection(COLLECTIONS.AUDIT_LOGS);
    await collection.insertOne({
      userId,
      userName,
      action,
      articleId,
      articleTitle,
      previousStatus,
      newStatus,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't let audit logging failures break the main flow
    console.error("Failed to log audit event:", error);
  }
}

// Audit action constants
export const AUDIT_ACTIONS = {
  ARTICLE_CREATED: "article.created",
  ARTICLE_UPDATED: "article.updated",
  ARTICLE_SUBMITTED: "article.submitted",
  ARTICLE_REVIEW_STARTED: "article.review_started",
  ARTICLE_REVISION_REQUESTED: "article.revision_requested",
  ARTICLE_RESUBMITTED: "article.resubmitted",
  ARTICLE_APPROVED: "article.approved",
  ARTICLE_PUBLISHED: "article.published",
  ARTICLE_REJECTED: "article.rejected",
  ARTICLE_ARCHIVED: "article.archived",
  ARTICLE_DELETED: "article.deleted",
  COMMENT_ADDED: "comment.added",
  USER_ROLE_CHANGED: "user.role_changed",
};
