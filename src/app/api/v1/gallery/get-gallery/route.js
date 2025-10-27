import { connectDB } from "@/app/api/lib/db";

import GalleryImage from "@/app/api/models/Gallery";
  export async function GET(req) {
    await connectDB();
    try {
        const GalleryItems = await GalleryImage.find({}).lean();
        if (!GalleryItems) {
            return new Response(JSON.stringify({ error: "No gallery items found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        return new Response(JSON.stringify({ GalleryItems }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }


  }