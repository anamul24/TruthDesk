export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/editor/", "/journalist/", "/api/", "/invite/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "https://truthdesk.vercel.app"}/sitemap.xml`,
  };
}
