import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";
import { articleSchema, createArticleDocument, ARTICLE_STATUS } from "@/lib/validations";
import slugify from "slugify";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit";

export async function POST(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const body = await request.json();
    const { action, ...articleData } = body;

    // Validate request data against schema
    const validatedData = articleSchema.parse(articleData);

    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const user = session.user;

    // Generate unique slug
    let baseSlug = slugify(validatedData.title, { lower: true, strict: true }).slice(0, 150);
    let slug = baseSlug;
    let slugCounter = 1;

    while (await collection.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Determine initial status based on the action
    const status = action === "submit" ? ARTICLE_STATUS.SUBMITTED : ARTICLE_STATUS.DRAFT;

    // Create the article document
    const newArticle = createArticleDocument({
      ...validatedData,
      slug,
      authorId: user.id,
      authorName: user.name,
      status,
      isTopNews: validatedData.isTopNews || false,
    });

    if (status === ARTICLE_STATUS.SUBMITTED) {
      newArticle.workflow.submittedAt = new Date();
    }

    const result = await collection.insertOne(newArticle);

    // Audit logging
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: status === ARTICLE_STATUS.DRAFT ? AUDIT_ACTIONS.ARTICLE_CREATED : AUDIT_ACTIONS.ARTICLE_SUBMITTED,
      articleId: result.insertedId.toString(),
      articleTitle: newArticle.title,
      newStatus: status,
    });

    return NextResponse.json({ 
      success: true, 
      articleId: result.insertedId,
      slug 
    }, { status: 201 });

  } catch (err) {
    console.error("Failed to create article:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const collection = await getCollection(COLLECTIONS.ARTICLES);
    
    // Build query based on user role
    const query = {};
    
    // If journalist, only show their own articles
    if (session.user.role === "journalist") {
      // Note: adjust this depending on how you store author ID
      query.authorName = session.user.name; 
    }

    if (status) {
      query.status = status;
    }

    const articles = await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ articles });
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
