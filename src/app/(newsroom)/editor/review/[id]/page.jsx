import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { ArrowLeft, Users, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import ReviewSidebar from "@/components/newsroom/editor/ReviewSidebar";
import { formatDistanceToNow, format } from "date-fns";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import DOMPurify from "isomorphic-dompurify";

export default async function EditorReviewArticle({ params }) {
  await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  
  const { id } = params;
  let articleId;
  try {
    articleId = new ObjectId(id);
  } catch (error) {
    notFound();
  }

  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const article = await articlesDb.findOne({ _id: articleId });

  if (!article) {
    notFound();
  }

  // Very simple sanitization for display
  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const htmlContent = article.content?.html || "<p>No content provided.</p>";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation */}
      <div className="flex-shrink-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/editor/review" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[200px] md:max-w-md">
              {article.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {article.lockedBy && (
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
              <AlertCircle size={14} /> Locked by Editor
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            article.status === 'FACT_CHECK' ? 'bg-yellow-100 text-yellow-800' :
            article.status === 'SUBMITTED' || article.status === 'RESUBMITTED' ? 'bg-indigo-100 text-indigo-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            {article.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Article Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-3xl mx-auto py-12 px-6 lg:px-12 bg-white min-h-full shadow-sm">
            
            {/* Metadata Header */}
            <div className="mb-10 pb-8 border-b border-slate-200">
              <h1 className="text-4xl md:text-5xl font-black font-serif text-slate-900 leading-tight mb-4">
                {article.title}
              </h1>
              {article.subtitle && (
                <h2 className="text-xl md:text-2xl font-medium text-slate-600 mb-6">
                  {article.subtitle}
                </h2>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Users size={16} /> <span className="font-semibold text-slate-700">{article.authorName || "Unknown"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {format(new Date(article.updatedAt), "MMMM d, yyyy h:mm a")}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-xs">
                  {article.categoryName || article.categoryId || "Category"}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.coverImage?.url && (
              <figure className="mb-10 rounded-xl overflow-hidden bg-slate-100">
                <img src={article.coverImage.url} alt={article.coverImage.alt || article.title} className="w-full h-auto object-cover max-h-[500px]" />
                {article.coverImage.alt && (
                  <figcaption className="p-3 text-xs text-slate-500 text-center border-t border-slate-200 bg-white">
                    {article.coverImage.alt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Body */}
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-a:text-indigo-600"
              dangerouslySetInnerHTML={createMarkup(htmlContent)}
            />

          </div>
        </div>

        {/* Right Side: Editorial Tools */}
        <ReviewSidebar article={JSON.parse(JSON.stringify(article))} />
      </div>
    </div>
  );
}
