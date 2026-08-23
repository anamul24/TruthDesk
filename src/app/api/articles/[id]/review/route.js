import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { ARTICLE_STATUS } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

// Start review: SUBMITTED → IN_REVIEW
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    // Only editors and admins can start reviews
    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (![ARTICLE_STATUS.SUBMITTED, ARTICLE_STATUS.RESUBMITTED].includes(article.status)) {
      return NextResponse.json(
        { error: `Cannot start review for article with status: ${article.status}` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.IN_REVIEW,
          "workflow.reviewedBy": session.user.name,
          "workflow.reviewedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_REVIEW_STARTED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.IN_REVIEW,
    });

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.IN_REVIEW });
  } catch (err) {
    console.error("Failed to start review:", err);
    return NextResponse.json({ error: "Failed to start review" }, { status: 500 });
  }
}
