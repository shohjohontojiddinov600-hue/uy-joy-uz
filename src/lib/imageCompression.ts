import { validateImageFile } from "./storage";

/**
 * Brauzerning o'zida rasmni siqish (compress) va o'lchamini moslash (max 1200px).
 * Yuklash tezligini oshiradi va Supabase Storage hajmini tejaydi.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<File> {
  validateImageFile(file);

  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error(`"${file.name}" rasmini o'qib bo'lmadi.`));
      element.src = imageUrl;
    });

    let { width, height } = img;

    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob) {
      return file;
    }

    // Agar siqilgan fayl asl fayldan katta bo'lsa va o'lcham o'zgarmagan bo'lsa, aslini qaytaramiz
    if (blob.size >= file.size && img.width <= maxDimension && img.height <= maxDimension) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function compressImageFiles(
  files: File[],
  maxDimension = 1200,
  quality = 0.82
): Promise<File[]> {
  return Promise.all(
    files.map((file) => compressImageFile(file, maxDimension, quality))
  );
}

