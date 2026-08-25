"use client";
import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

/**
 * NewsletterSection — Email subscription form.
 * Saves to MongoDB subscribers collection via API.
 */
const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You've been subscribed! Thank you.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  };

  return (
    <section
      className="py-16"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
    >
      <div className="container mx-auto px-4 max-w-2xl text-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-red-400" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Stay Updated
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Get the latest TruthDesk news delivered to your inbox.
          <br className="hidden sm:block" />
          No spam. Unsubscribe anytime.
        </p>

        {/* Form */}
        {status === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 text-emerald-400 text-sm font-medium">
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shrink-0"
            >
              {status === "loading" ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Error message */}
        {status === "error" && (
          <p className="text-red-400 text-xs mt-3">{message}</p>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
