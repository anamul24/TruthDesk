import { NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/authorize";

// Simple upload handler - stores as base64 data URL for now
// Can be upgraded to Cloudinary when credentials are provided
export async function POST(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Try Cloudinary if credentials are available
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      // Upload to Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const uploadForm = new FormData();
      uploadForm.append("file", dataUri);
      uploadForm.append("upload_preset", "truth_desk");
      uploadForm.append("api_key", apiKey);

      const res = await fetch(cloudinaryUrl, {
        method: "POST",
        body: uploadForm,
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ url: data.secure_url });
      }
    }

    // Fallback: convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUri });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
