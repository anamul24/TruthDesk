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

    // Only the author can resubmit
    if (article.authorName !== session.user.name) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate transition: REVISION_REQUESTED → RESUBMITTED
    if (!isValidTransition(article.status, ARTICLE_STATUS.RESUBMITTED)) {
      return NextResponse.json(
        { error: `Cannot resubmit article with status: ${article.status}` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.RESUBMITTED,
          "workflow.submittedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_RESUBMITTED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.RESUBMITTED,
    });

    await createNotification({
      userId: "editors",
      type: NOTIFICATION_TYPES.ARTICLE_RESUBMITTED,
      title: "Article Resubmitted",
      message: `"${article.title}" has been resubmitted by ${session.user.name}.`,
      articleId: id,
      articleTitle: article.title,
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      link: `/editor/articles/${id}`,
    });

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.RESUBMITTED });
  } catch (err) {
    console.error("Failed to resubmit article:", err);
    return NextResponse.json({ error: "Failed to resubmit article" }, { status: 500 });
  }
}
