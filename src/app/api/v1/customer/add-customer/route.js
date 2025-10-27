import { connectDB } from "@/app/api/lib/db";
import Customer from "@/app/api/models/Customer";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const WHATSAPP_API_URL = `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(req) {
  await connectDB();

  try {
    const { customerName, mobileNumber, imageUrls } = await req.json();

    if (!customerName || !mobileNumber || !imageUrls?.length) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const customer = await Customer.create({
      customerName,
      mobileNumber,
      images: imageUrls,
    });

    // 1️⃣ Create HTML gallery dynamically
    const htmlContent = generateGalleryHTML(customerName, imageUrls);

    // 2️⃣ Upload HTML to S3
    const fileName = `galleries/${customerName}-${Date.now()}.html`;
    const s3Upload = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: htmlContent,
        ContentType: "text/html",
      })
      .promise();

    const galleryUrl = s3Upload.Location; // public link

    // 3️⃣ Send WhatsApp message
    await sendWhatsAppTemplate(customerName, mobileNumber, galleryUrl);

    return new Response(
      JSON.stringify({ id: customer._id, customer, galleryUrl }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

function generateGalleryHTML(name, imageUrls) {
  const imgTags = imageUrls
    .map(
      (url) =>
        `<img src="${url}" style="max-width:250px;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);margin:10px;">`
    )
    .join("");
  return `
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${name}'s Designs | Tradition's Designer Boutique</title>
<style>
body { font-family: Arial, sans-serif; background:#f9f9f9; text-align:center; }
h2 { color:#333; margin-top:20px; }
.container { display:flex; flex-wrap:wrap; justify-content:center; padding:20px; }
</style>
</head>
<body>
<h2>Hi ${name}! 👗 Here are your design inspirations.</h2>
<div class="container">${imgTags}</div>
<p style="color:#888;margin:30px;">© Tradition's Designer Boutique</p>
</body></html>
`;
}

async function sendWhatsAppTemplate(name, mobile, galleryUrl) {
  const phone = mobile.startsWith("91") ? mobile : `91${mobile}`;
const urlPath = new URL(galleryUrl).pathname.replace(/^\/+/, "");
  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "view_gallery2",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: name }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: urlPath }],
        },
      ],
    },
  };

  const res = await fetch(WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Failed to send WhatsApp");
  return data;
}
