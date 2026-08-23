import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { ARTICLE_STATUS, isValidTransition } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Only the author can submit their article
    if (article.authorName !== session.user.name) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate transition: DRAFT → SUBMITTED
    if (!isValidTransition(article.status, ARTICLE_STATUS.SUBMITTED)) {
      return NextResponse.json(
        { error: `Cannot submit article with status: ${article.status}` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.SUBMITTED,
          "workflow.submittedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_SUBMITTED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.SUBMITTED,
    });

    // Notify editors about new submission
    // In a real app, you'd fetch all editor user IDs here
    // For now, we create a general notification
    await createNotification({
      userId: "editors", // placeholder for broadcast to editors
      type: NOTIFICATION_TYPES.ARTICLE_SUBMITTED,
      title: "New Article Submitted",
      message: `"${article.title}" has been submitted for review by ${session.user.name}.`,
      articleId: id,
      articleTitle: article.title,
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      link: `/editor/articles/${id}`,
    });

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.SUBMITTED });
  } catch (err) {
    console.error("Failed to submit article:", err);
    return NextResponse.json({ error: "Failed to submit article" }, { status: 500 });
  }
}
