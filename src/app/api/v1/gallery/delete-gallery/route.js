// src/app/api/v1/gallery/delete-gallery/route.js
import { NextResponse } from "next/server";
import GalleryImage from "@/app/api/models/Gallery";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectDB } from "@/app/api/lib/db";


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME;

export async function DELETE(req) {
  try {
    await connectDB();

    // Accept JSON body or fallback to query param
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // no body or invalid JSON
      // We'll still try to read ?id=...
    }

    const urlObj = new URL(req.url);
    const qId = urlObj.searchParams.get("id");

    const id = body.id || qId;
    if (!id) return NextResponse.json({ error: "Missing 'id' (send in body or ?id=...)" }, { status: 400 });

    // Ensure item exists and get stored URL (safer than trusting client)
    const item = await GalleryImage.findById(id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const storedUrl = item.url;

    // Delete DB record first (or soft delete if you prefer)
    await GalleryImage.findByIdAndDelete(id);

    // Try to compute S3 key and delete object (best-effort)
    try {
      let key = null;
      if (storedUrl) {
        // common case: https://BUCKET.s3.REGION.amazonaws.com/key/path
        const parts = storedUrl.split(".amazonaws.com/");
        if (parts.length > 1) {
          key = parts[1];
        } else {
          // fallback: parse pathname
          try {
            const parsed = new URL(storedUrl);
            key = parsed.pathname.replace(/^\/+/, "");
          } catch (e) {
            // last resort, maybe storedUrl is already the key
            key = storedUrl;
          }
        }
      }

      if (key && BUCKET) {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      }
    } catch (s3err) {
      // don't fail the whole request because of S3 deletion — we already removed DB doc.
      console.warn("S3 delete failed for id", id, s3err?.message || s3err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete-gallery error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
