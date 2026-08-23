import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { articleUpdateSchema, ARTICLE_STATUS } from "@/lib/validations";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";
import slugify from "slugify";

export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { slug: id };
    }

    const article = await collection.findOne(query);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Journalists can only view their own articles
    if (session.user.role === "journalist" && article.authorName !== session.user.name) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Serialize ObjectId
    const serialized = { ...article, _id: article._id.toString() };

    return NextResponse.json({ article: serialized });
  } catch (err) {
    console.error("Failed to fetch article:", err);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Journalists can only edit their own articles in DRAFT or REVISION_REQUESTED status
    if (session.user.role === "journalist") {
      if (article.authorName !== session.user.name) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (![ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.REVISION_REQUESTED].includes(article.status)) {
        return NextResponse.json(
          { error: "Can only edit articles in Draft or Revision Requested status" },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validatedData = articleUpdateSchema.parse(body);

    // If title changed, regenerate slug
    const updateData = { ...validatedData, updatedAt: new Date() };
    if (validatedData.title && validatedData.title !== article.title) {
      let baseSlug = slugify(validatedData.title, { lower: true, strict: true }).slice(0, 150);
      let slug = baseSlug;
      let counter = 1;
      while (await collection.findOne({ slug, _id: { $ne: new ObjectId(id) } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    // Save version snapshot before updating (for version history)
    const revisionsCollection = await getCollection(COLLECTIONS.ARTICLE_REVISIONS);
    await revisionsCollection.insertOne({
      articleId: article._id.toString(),
      version: article.revision?.version || 1,
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      editedBy: session.user.name,
      editedById: session.user.id,
      createdAt: new Date(),
    });

    // Increment version
    updateData["revision.version"] = (article.revision?.version || 1) + 1;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_UPDATED,
      articleId: id,
      articleTitle: updateData.title || article.title,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update article:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { id } = await params;
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const article = await collection.findOne({ _id: new ObjectId(id) });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Only authors can delete their own drafts, admins can delete anything
    if (session.user.role === "journalist") {
      if (article.authorName !== session.user.name) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (article.status !== ARTICLE_STATUS.DRAFT) {
        return NextResponse.json(
          { error: "Can only delete draft articles" },
          { status: 400 }
        );
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    await logAuditEvent({
      userId: session.user.id,
      userName: session.user.name,
      action: AUDIT_ACTIONS.ARTICLE_DELETED,
      articleId: id,
      articleTitle: article.title,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete article:", err);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
