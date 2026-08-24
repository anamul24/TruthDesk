"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Loader2,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function EditorReviewArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [revisionComment, setRevisionComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  async function fetchArticle() {
    try {
      const res = await fetch(`/api/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
      } else {
        toast.error("Article not found");
        router.push("/editor/review");
      }
    } catch {
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setActionLoading("approve");
    try {
      const res = await fetch(`/api/articles/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Article approved and published!");
        router.push("/editor/review");
      } else {
        toast.error(data.error || "Failed to approve article");
      }
    } catch {
      toast.error("Failed to approve article");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRequestRevision() {
    if (!revisionComment.trim()) {
      toast.error("Please provide a revision comment");
      return;
    }
    setActionLoading("revision");
    try {
      const res = await fetch(`/api/articles/${id}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: revisionComment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Revision requested successfully");
        router.push("/editor/review");
      } else {
        toast.error(data.error || "Failed to request revision");
      }
    } catch {
      toast.error("Failed to request revision");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading("reject");
    try {
      const res = await fetch(`/api/articles/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Article rejected");
        router.push("/editor/review");
      } else {
        toast.error(data.error || "Failed to reject article");
      }
    } catch {
      toast.error("Failed to reject article");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStartReview() {
    setActionLoading("start");
    try {
      const res = await fetch(`/api/articles/${id}/review`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Review started!");
        fetchArticle();
      } else {
        toast.error(data.error || "Failed to start review");
      }
    } catch {
      toast.error("Failed to start review");
    } finally {
      setActionLoading(null);
    }
  }

  function renderContent(content) {
    if (!content) return <p className="text-slate-500 italic">No content</p>;
    if (typeof content === "string") {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (content.type === "doc" && content.content) {
      return (
        <div className="prose prose-slate max-w-none">
          {content.content.map((node, i) => renderNode(node, i))}
        </div>
      );
    }
    return <pre className="text-sm text-slate-600">{JSON.stringify(content, null, 2)}</pre>;
  }

  function renderNode(node, key) {
    if (!node) return null;
    switch (node.type) {
      case "paragraph":
        return (
          <p key={key} className="mb-4 text-slate-700 leading-relaxed">
            {node.content?.map((c, i) => renderInline(c, i))}
          </p>
        );
      case "heading":
        const Tag = `h${node.attrs?.level || 2}`;
        return (
          <Tag key={key} className="font-bold text-slate-900 mt-6 mb-3">
            {node.content?.map((c, i) => renderInline(c, i))}
          </Tag>
        );
      case "bulletList":
        return (
          <ul key={key} className="list-disc pl-6 mb-4">
            {node.content?.map((li, i) => (
              <li key={i}>{li.content?.map((p, j) => renderNode(p, j))}</li>
            ))}
          </ul>
        );
      case "blockquote":
        return (
          <blockquote key={key} className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">
            {node.content?.map((c, i) => renderNode(c, i))}
          </blockquote>
        );
      default:
        return null;
    }
  }

  function renderInline(node, key) {
    if (!node) return null;
    if (node.type === "text") {
      let text = node.text;
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === "bold") text = <strong key={key}>{text}</strong>;
          if (mark.type === "italic") text = <em key={key}>{text}</em>;
        }
      }
      return <span key={key}>{text}</span>;
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!article) return null;

  const canReview = ["SUBMITTED", "RESUBMITTED", "IN_REVIEW"].includes(article.status);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/editor/review"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Review Queue
        </Link>
        <Link
          href={`/editor/articles/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Edit Article
        </Link>
      </div>

      {/* Article Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <ArticleStatusBadge status={article.status} size="md" />
            {["SUBMITTED", "RESUBMITTED"].includes(article.status) && (
              <button
                onClick={handleStartReview}
                disabled={actionLoading === "start"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {actionLoading === "start" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Start Review
              </button>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-lg text-slate-600 mb-4">{article.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {article.authorName || "Unknown"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {article.updatedAt
                ? `Updated ${formatDistanceToNow(new Date(article.updatedAt))} ago`
                : "Recently"}
            </span>
            {article.categoryName && (
              <span className="flex items-center gap-1.5">
                <Tag size={14} />
                {article.categoryName}
              </span>
            )}
          </div>
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="p-6 md:p-8">
          {article.excerpt && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-slate-500 mb-1">Excerpt</p>
              <p className="text-slate-700 italic">{article.excerpt}</p>
            </div>
          )}
          <div className="prose prose-slate max-w-none text-slate-700">
            {renderContent(article.content)}
          </div>
        </div>
      </div>

      {/* Review Actions */}
      {canReview && article.status === "IN_REVIEW" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Editorial Decision</h2>

          {/* Approve */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApprove}
              disabled={!!actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {actionLoading === "approve" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Approve & Publish
            </button>
            <button
              onClick={() => {
                setShowRevisionForm(!showRevisionForm);
                setShowRejectForm(false);
              }}
              disabled={!!actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-60"
            >
              <AlertCircle size={16} />
              Request Revision
            </button>
            <button
              onClick={() => {
                setShowRejectForm(!showRejectForm);
                setShowRevisionForm(false);
              }}
              disabled={!!actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              <XCircle size={16} />
              Reject Article
            </button>
          </div>

          {/* Revision Form */}
          {showRevisionForm && (
            <div className="border border-orange-200 bg-orange-50 rounded-xl p-5 space-y-3">
              <label className="block text-sm font-semibold text-orange-800">
                Revision Comment *
              </label>
              <textarea
                value={revisionComment}
                onChange={(e) => setRevisionComment(e.target.value)}
                placeholder="Explain what needs to be revised..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all resize-none"
              />
              <button
                onClick={handleRequestRevision}
                disabled={actionLoading === "revision"}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {actionLoading === "revision" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Send Revision Request
              </button>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-5 space-y-3">
              <label className="block text-sm font-semibold text-red-800">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this article is being rejected..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-all resize-none"
              />
              <button
                onClick={handleReject}
                disabled={actionLoading === "reject"}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {actionLoading === "reject" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
