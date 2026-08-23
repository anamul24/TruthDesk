import { getCollection, COLLECTIONS } from "./db";

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  articleId = null,
  articleTitle = null,
  fromUserId = null,
  fromUserName = null,
  link = null,
}) {
  try {
    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    await collection.insertOne({
      userId,
      type,
      title,
      message,
      articleId,
      articleTitle,
      fromUserId,
      fromUserName,
      link,
      read: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

// Notification types
export const NOTIFICATION_TYPES = {
  ARTICLE_SUBMITTED: "article.submitted",
  REVISION_REQUESTED: "revision.requested",
  ARTICLE_APPROVED: "article.approved",
  ARTICLE_PUBLISHED: "article.published",
  ARTICLE_REJECTED: "article.rejected",
  ARTICLE_RESUBMITTED: "article.resubmitted",
  COMMENT_ADDED: "comment.added",
};
