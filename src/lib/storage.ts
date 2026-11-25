import { supabase } from "./supabase";

const BUCKET_NAME = "property-images";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" rasm fayli emas.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`"${file.name}" hajmi 5 MB dan oshmasligi kerak.`);
  }

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

