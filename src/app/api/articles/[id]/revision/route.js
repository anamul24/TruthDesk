import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { ARTICLE_STATUS, revisionRequestSchema } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

// Request revision: IN_REVIEW → REVISION_REQUESTED
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { comment } = revisionRequestSchema.parse(body);

    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== ARTICLE_STATUS.IN_REVIEW) {
      return NextResponse.json(
        { error: `Cannot request revision for article with status: ${article.status}` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.REVISION_REQUESTED,
          "revision.requestedBy": session.user.name,
          "revision.requestedAt": new Date(),
          "revision.comment": comment,
          updatedAt: new Date(),
        },
      }
    );

    // Save the comment in editorComments collection too
    const commentsCollection = await getCollection(COLLECTIONS.EDITOR_COMMENTS);
    await commentsCollection.insertOne({
      articleId: id,
      content: comment,
      type: "revision_request",
      authorId: session.user.id,
      authorName: session.user.name,
      createdAt: new Date(),
    });

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_REVISION_REQUESTED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.REVISION_REQUESTED,
      metadata: { comment },
    });

    // Notify the journalist
    await createNotification({
      userId: article.authorId,
      type: NOTIFICATION_TYPES.REVISION_REQUESTED,
      title: "Revision Requested",
      message: `Editor ${session.user.name} has requested revisions for "${article.title}".`,
      articleId: id,
      articleTitle: article.title,
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      link: `/journalist/articles/${id}`,
    });

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.REVISION_REQUESTED });
  } catch (err) {
    console.error("Failed to request revision:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to request revision" }, { status: 500 });
  }
}
