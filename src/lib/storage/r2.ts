import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3ClientInstance: S3Client | null = null;

/**
 * Gets or initializes lazy S3Client configured for Cloudflare R2 endpoint.
 */
function getR2Client(): S3Client {
  if (s3ClientInstance) return s3ClientInstance;

  const rawAccountId = (process.env.R2_ACCOUNT_ID || "").trim();
  // Sanitasi Account ID dari URL atau domain jika user mengontekstualisasikan full URL
  const accountId = rawAccountId.replace(/^https?:\/\//i, "").split(".")[0].split("/")[0];
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "[Cloudflare R2] Kredensial R2 belum lengkap di environment variable (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)."
    );
  }

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
}

/**
 * Generates direct public URL for assets served via Cloudflare R2 Custom Domain (CDN).
 * Directly accessible in Indonesia with zero egress fees and zero server load.
 *
 * @param bucket - Storage bucket name ('tts-cache', 'exam-assets', 'asset')
 * @param objectPath - Path to the file inside the bucket
 */
export function getR2PublicUrl(bucket: string, objectPath: string): string {
  const cleanPath = objectPath.replace(/^\/+/, "");
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (baseUrl) {
    // If objectPath already includes bucket prefix, prevent duplicating bucket in path
    if (cleanPath.startsWith(`${bucket}/`)) {
      return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/${bucket}/${cleanPath}`;
  }

  // Fallback ke Supabase Storage jika R2_PUBLIC_URL belum dikonfigurasi
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
  if (cleanPath.startsWith(`${bucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Uploads a file buffer directly to Cloudflare R2 storage bucket.
 *
 * @param bucket - Target R2 bucket name
 * @param objectPath - Key path where file will be stored
 * @param body - Buffer or Uint8Array file content
 * @param contentType - MIME type (e.g. 'audio/mpeg', 'image/png')
 */
export async function uploadToR2(
  bucket: string,
  objectPath: string,
  body: Buffer | Uint8Array,
  contentType: string = "application/octet-stream"
): Promise<string> {
  const client = getR2Client();
  const cleanPath = objectPath.replace(/^\/+/, "");
  const targetBucket = process.env.R2_BUCKET_NAME || bucket;

  const key = targetBucket === bucket ? cleanPath : `${bucket}/${cleanPath}`;

  await client.send(
    new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return getR2PublicUrl(bucket, cleanPath);
}

/**
 * Deletes a file from Cloudflare R2 storage bucket.
 *
 * @param bucket - Target R2 bucket name
 * @param objectPath - Key path of file to delete
 */
export async function deleteFromR2(bucket: string, objectPath: string): Promise<void> {
  const client = getR2Client();
  const cleanPath = objectPath.replace(/^\/+/, "");
  const targetBucket = process.env.R2_BUCKET_NAME || bucket;

  const key = targetBucket === bucket ? cleanPath : `${bucket}/${cleanPath}`;

  await client.send(
    new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: key,
    })
  );
}
