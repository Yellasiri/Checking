import { connectDB } from "@/app/api/lib/db";
import GalleryImage from "@/app/api/models/Gallery";

export async function POST(req) {
  await connectDB();
  try {
    const { category, type, color, date, imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL required" }), {
        status: 400,
      });
    }
    // Save gallery item in DB according to schema
    const galleryItem = await GalleryImage.create({
    
      fileName: imageUrl.split("/").pop(),
      url: imageUrl,
      category,
      categoryType: type,
      color,
      addedAt: date ? new Date(date) : new Date(),
    });
    return new Response(JSON.stringify({ id: galleryItem._id, galleryItem }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
