import React from "react";
import { ObjectId } from "mongodb";
import { getSession, requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit3,
  Send,
  Clock,
  User,
  Tag,
  FileText,
  Eye,
  MessageSquare,
  History,
} from "lucide-react";
import EditorComments from "@/components/newsroom/EditorComments";

export default async function JournalistArticleDetailPage({ params }) {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const user = session?.user;
  const { id } = await params;

  const collection = await getCollection(COLLECTIONS.ARTICLES);
  let article;
  try {
    article = await collection.findOne({ _id: new ObjectId(id) });
  } catch {
    article = await collection.findOne({ slug: id });
  }

  if (!article) {
    return (
      <div className="p-10 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-slate-500 mt-2">
          This article doesn't exist or you don't have access.
        </p>
        <Link
          href="/journalist/articles"
          className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={16} /> Back to My Stories
        </Link>
      </div>
    );
  }

  // Fetch comments
  const commentsCollection = await getCollection(COLLECTIONS.EDITOR_COMMENTS);
  const comments = await commentsCollection
    .find({ articleId: article._id.toString() })
    .sort({ createdAt: -1 })
    .toArray();

  const serializedComments = comments.map((c) => ({
    ...c,
    _id: c._id.toString(),
    createdAt: c.createdAt?.toISOString(),
  }));

  const canEdit = ["DRAFT", "REVISION_REQUESTED"].includes(article.status);
  const articleId = article._id.toString();

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/journalist/articles"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Stories
      </Link>

      {/* Article Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Image */}
        {article.coverImage?.url && (
          <div className="aspect-[21/9] relative overflow-hidden bg-slate-100">
            <img
              src={article.coverImage.url}
              alt={article.coverImage.alt || article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          {/* Status & Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArticleStatusBadge status={article.status} />
              {article.revision?.version > 1 && (
                <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Version {article.revision.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link
                  href={`/journalist/articles/${articleId}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit Article
                </Link>
              )}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-xl text-slate-600 mt-3">{article.subtitle}</p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-y border-slate-100 py-4">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {article.authorName}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {article.createdAt
                ? format(new Date(article.createdAt), "MMM d, yyyy 'at' h:mm a")
                : "Unknown date"}
            </span>
            {article.categoryName && (
              <>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Tag size={14} />
                  {article.categoryName}
                </span>
              </>
            )}
            {article.stats?.views > 0 && (
              <>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Eye size={14} />
                  {article.stats.views} views
                </span>
              </>
            )}
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-slate-300">
              <p className="text-slate-700 italic">{article.excerpt}</p>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-slate prose-lg max-w-none">
            {article.content ? (
              typeof article.content === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div className="text-slate-600">
                  <p className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-4 py-3">
                    📝 This article was written using the rich text editor. The
                    content preview is available in the editor view.
                  </p>
                </div>
              )
            ) : (
              <p className="text-slate-400 italic">No content yet.</p>
            )}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revision Info */}
      {article.status === "REVISION_REQUESTED" && article.revision?.comment && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-600" />
            <h3 className="font-semibold text-orange-900">Revision Requested</h3>
          </div>
          <p className="text-orange-800">{article.revision.comment}</p>
          <p className="text-sm text-orange-600">
            By {article.revision.requestedBy}
            {article.revision.requestedAt &&
              ` · ${format(new Date(article.revision.requestedAt), "MMM d, yyyy 'at' h:mm a")}`}
          </p>
          {canEdit && (
            <Link
              href={`/journalist/articles/${articleId}/edit`}
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Edit3 size={16} />
              Edit & Resubmit
            </Link>
          )}
        </div>
      )}

      {/* Rejection Info */}
      {article.status === "REJECTED" && article.revision?.comment && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-900">Article Rejected</h3>
          </div>
          <p className="text-red-800">{article.revision.comment}</p>
          <p className="text-sm text-red-600">
            By {article.revision.requestedBy}
          </p>
        </div>
      )}

      {/* Editor Comments */}
      {serializedComments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <MessageSquare size={18} />
            Editor Comments ({serializedComments.length})
          </h3>
          <EditorComments comments={serializedComments} />
        </div>
      )}

      {/* Workflow Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <History size={18} />
          Workflow Timeline
        </h3>
        <div className="space-y-3">
          <TimelineItem
            label="Created"
            date={article.createdAt}
            active
          />
          {article.workflow?.submittedAt && (
            <TimelineItem
              label="Submitted for Review"
              date={article.workflow.submittedAt}
              active
            />
          )}
          {article.workflow?.reviewedAt && (
            <TimelineItem
              label={`Reviewed by ${article.workflow.reviewedBy || "Editor"}`}
              date={article.workflow.reviewedAt}
              active
            />
          )}
          {article.workflow?.publishedAt && (
            <TimelineItem
              label="Published"
              date={article.workflow.publishedAt}
              active
              highlight
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, date, active, highlight }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          highlight
            ? "bg-green-500"
            : active
              ? "bg-blue-500"
              : "bg-slate-300"
        }`}
      />
      <div className="flex-1">
        <span className={`text-sm font-medium ${highlight ? "text-green-700" : "text-slate-700"}`}>
          {label}
        </span>
      </div>
      {date && (
        <span className="text-xs text-slate-400">
          {format(new Date(date), "MMM d, yyyy h:mm a")}
        </span>
      )}
    </div>
  );
}
