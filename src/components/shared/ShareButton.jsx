"use client";

import React, { useState, useRef, useEffect } from "react";
import { CiShare2 } from "react-icons/ci";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn, FaLink } from "react-icons/fa";
import { toast } from "sonner";

export default function ShareButton({ title, text, url }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = encodeURIComponent(title || "TruthDesk News");
  const shareText = encodeURIComponent(text || "Check out this article on TruthDesk");
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF size={14} />,
      color: "bg-[#1877F2] text-white hover:bg-[#1864D9]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter / X",
      icon: <FaTwitter size={14} />,
      color: "bg-black text-white hover:bg-gray-800",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={15} />,
      color: "bg-[#25D366] text-white hover:bg-[#20B058]",
      href: `https://api.whatsapp.com/send?text=${shareTitle}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={14} />,
      color: "bg-[#0A66C2] text-white hover:bg-[#084E96]",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "TruthDesk News",
          text: text || "Check out this article on TruthDesk",
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors ${isOpen ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50 text-gray-400 hover:text-gray-700"}`}
        title="Share this article"
      >
        <CiShare2 className="text-xl" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share Article</h4>
          </div>
          <div className="p-2 space-y-1">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                  <CiShare2 size={16} />
                </div>
                Share via Device...
              </button>
            )}
            
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${social.color}`}>
                  {social.icon}
                </div>
                {social.name}
              </a>
            ))}
            
            <div className="h-px bg-gray-100 my-1 mx-2" />
            
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                <FaLink size={12} />
              </div>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
