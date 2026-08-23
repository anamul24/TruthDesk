import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { ARTICLE_STATUS, rejectSchema } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

// Reject article: IN_REVIEW → REJECTED
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = rejectSchema.parse(body);

    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== ARTICLE_STATUS.IN_REVIEW) {
      return NextResponse.json(
        { error: `Cannot reject article with status: ${article.status}` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.REJECTED,
          "revision.comment": reason,
          "revision.requestedBy": session.user.name,
          "revision.requestedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Save comment
    const commentsCollection = await getCollection(COLLECTIONS.EDITOR_COMMENTS);
    await commentsCollection.insertOne({
      articleId: id,
      content: reason,
      type: "rejection",
      authorId: session.user.id,
      authorName: session.user.name,
      createdAt: new Date(),
    });

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_REJECTED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.REJECTED,
      metadata: { reason },
    });

    await createNotification({
      userId: article.authorId,
      type: NOTIFICATION_TYPES.ARTICLE_REJECTED,
      title: "Article Rejected",
      message: `Your article "${article.title}" has been rejected. Reason: ${reason.substring(0, 100)}...`,
      articleId: id,
      articleTitle: article.title,
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      link: `/journalist/articles/${id}`,
    });

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.REJECTED });
  } catch (err) {
    console.error("Failed to reject article:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reject article" }, { status: 500 });
  }
}
