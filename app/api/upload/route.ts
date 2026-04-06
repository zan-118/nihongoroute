import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const upload = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "nihongopath" }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json(upload);
}
