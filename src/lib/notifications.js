import { getCollection, COLLECTIONS } from "./db";
import { emitNewsroomEvent, NEWSROOM_EVENTS } from "./events";

/**
 * Create a notification for a user and emit a realtime SSE event.
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
  // Optional: also emit to roles (for editor/admin broadcast)
  broadcastToRoles = [],
}) {
  try {
    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    const result = await collection.insertOne({
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

    // Emit realtime SSE event
    const targetUserIds = userId ? [userId] : [];
    emitNewsroomEvent(
      NEWSROOM_EVENTS.NOTIFICATION_CREATED,
      {
        _id: result.insertedId.toString(),
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
        createdAt: new Date().toISOString(),
      },
      targetUserIds,
      broadcastToRoles
    );

    return result.insertedId;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Create notifications for all users with a specific role.
 * Used to notify all editors when a new article is submitted, etc.
 */
export async function notifyRole(role, { type, title, message, articleId = null, articleTitle = null, fromUserId = null, fromUserName = null, link = null }) {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    const users = await db.collection("user").find({ role }).project({ _id: 1 }).toArray();

    if (users.length === 0) return;

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);
    const now = new Date();

    const notifications = users.map((u) => ({
      userId: u._id.toString(),
      type,
      title,
      message,
      articleId,
      articleTitle,
      fromUserId,
      fromUserName,
      link,
      read: false,
      createdAt: now,
    }));

    await collection.insertMany(notifications);

    // Broadcast to all users with this role via SSE
    emitNewsroomEvent(
      NEWSROOM_EVENTS.NOTIFICATION_CREATED,
      {
        type,
        title,
        message,
        articleId,
        articleTitle,
        fromUserId,
        fromUserName,
        link,
        read: false,
        createdAt: now.toISOString(),
      },
      [],
      [role]
    );
  } catch (error) {
    console.error("Failed to notify role:", error);
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
  ASSIGNMENT_CREATED: "assignment.created",
  PITCH_CREATED: "pitch.created",
  PITCH_UPDATED: "pitch.updated",
  BREAKING_NEWS: "breaking.news",
  INVITATION_CREATED: "invitation.created",
  INVITATION_ACCEPTED: "invitation.accepted",
};
