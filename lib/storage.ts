import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const LIMITS = {
  "product-images": { maxBytes: 5 * 1024 * 1024, mime: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  "site-assets": { maxBytes: 5 * 1024 * 1024, mime: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  "models-3d": { maxBytes: 20 * 1024 * 1024, mime: ["model/gltf-binary", "application/octet-stream"] },
} as const;

type Bucket = keyof typeof LIMITS;

function safeExtension(filename: string, bucket: Bucket) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (bucket === "models-3d") return ext === "glb" ? "glb" : null;
  return ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : null;
}

export async function uploadToBucket(
  supabase: SupabaseClient,
  bucket: Bucket,
  file: File
): Promise<{ url: string } | { error: string }> {
  const limit = LIMITS[bucket];
  if (file.size > limit.maxBytes) {
    return { error: `File quá lớn (tối đa ${Math.round(limit.maxBytes / 1024 / 1024)}MB)` };
  }
  const ext = safeExtension(file.name, bucket);
  if (!ext || (bucket !== "models-3d" && !limit.mime.includes(file.type as never))) {
    return { error: "Định dạng file không được hỗ trợ" };
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
