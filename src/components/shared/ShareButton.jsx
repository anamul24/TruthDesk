"use client";

import React from "react";
import { CiShare2 } from "react-icons/ci";
import { toast } from "sonner";

export default function ShareButton({ title, text, url }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "TruthDesk News",
          text: text || "Check out this article on TruthDesk",
          url: url || window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="hover:text-gray-700 transition-colors" 
      title="Share"
    >
      <CiShare2 className="text-xl" />
    </button>
  );
}
