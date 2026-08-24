import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { ARTICLE_STATUS } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

// Approve and publish: IN_REVIEW → PUBLISHED
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    if (!["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== ARTICLE_STATUS.IN_REVIEW) {
      return NextResponse.json(
        { error: `Cannot approve article with status: ${article.status}` },
        { status: 400 }
      );
    }

    const now = new Date();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: ARTICLE_STATUS.PUBLISHED,
          "workflow.approvedBy": session.user.name,
          "workflow.approvedAt": now,
          "workflow.publishedAt": now,
          "workflow.reviewedBy": session.user.name,
          updatedAt: now,
        },
      }
    );

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_PUBLISHED,
      articleId: id,
      articleTitle: article.title,
      previousStatus: article.status,
      newStatus: ARTICLE_STATUS.PUBLISHED,
    });

    // Notify the journalist
    await createNotification({
      userId: article.authorId,
      type: NOTIFICATION_TYPES.ARTICLE_PUBLISHED,
      title: "Article Published! 🎉",
      message: `Your article "${article.title}" has been approved and published by ${session.user.name}.`,
      articleId: id,
      articleTitle: article.title,
      fromUserId: session.user.id,
      fromUserName: session.user.name,
      link: `/journalist/articles/${id}`,
    });

    // Revalidate public pages immediately so the article shows on the portal
    revalidatePath("/");
    revalidatePath("/category/[id]", "page");

    return NextResponse.json({ success: true, status: ARTICLE_STATUS.PUBLISHED });
  } catch (err) {
    console.error("Failed to approve article:", err);
    return NextResponse.json({ error: "Failed to approve article" }, { status: 500 });
  }
}
