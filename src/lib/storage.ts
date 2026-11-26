import { supabase } from "./supabase";

const BUCKET_NAME = "property-images";
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function validateImageFile(file: File): void {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(file.type) ||
    (ext && !ALLOWED_IMAGE_EXTENSIONS.includes(ext))
  ) {
    throw new Error(
      `"${file.name}" qo'llab-quvvatlanmaydi. Faqat JPG, PNG yoki WEBP rasm yuklang.`
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`"${file.name}" hajmi 5 MB dan oshmasligi kerak.`);
  }
}

/**
 * Bitta rasmni Supabase Storage'dagi 'property-images' bucketiga yuklaydi
 * va uning public URL manzilini qaytaradi.
 */
export async function uploadPropertyImage(
  file: File,
  userId: string
): Promise<string> {
  if (!supabase) {
    throw new Error(
      "Supabase sozlanmagan. .env.local fayliga NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY ni kiriting."
    );
  }

  validateImageFile(file);

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${uniqueName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Rasm yuklashda xatolik: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Bir nechta rasmni parallel ravishda 'property-images' bucketiga yuklaydi.
 */
export async function uploadPropertyImages(
  files: File[],
  userId: string
): Promise<string[]> {
  if (files.length === 0) return [];
  return Promise.all(files.map((file) => uploadPropertyImage(file, userId)));
}

/**
 * Supabase Storage'dagi public URL ro'yxati bo'yicha rasmlarni bucketdan o'chiradi.
 */
export async function deletePropertyImages(imageUrls: string[]): Promise<void> {
  if (!supabase || imageUrls.length === 0) return;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const paths = imageUrls
    .map((url) => {
      const idx = url.indexOf(marker);
      return idx !== -1 ? decodeURIComponent(url.slice(idx + marker.length)) : null;
    })
    .filter((p): p is string => Boolean(p));

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);
  if (error) {
    console.error("Storage rasmlarini o'chirishda xatolik:", error.message);
  }
}

