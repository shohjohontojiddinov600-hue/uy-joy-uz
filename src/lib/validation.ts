import { z } from "zod";

/**
 * XSS va xavfli HTML belgilarini tozalash funksiyasi.
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export const listingFormSchema = z.object({
  category: z.enum(["sale", "rent", "student_dorm"], {
    message: "Kategoriya noto'g'ri tanlangan.",
  }),
  title: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(5, "Sarlavha kamida 5 ta belgidan iborat bo'lishi kerak.")
        .max(140, "Sarlavha 140 ta belgidan oshmasligi kerak.")
    ),
  city: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, "Shahar yoki viloyatni tanlang.")),
  district: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(100, "Tuman nomi juda uzun.")),
  price: z.coerce
    .number({ message: "Narx faqat raqam bo'lishi kerak." })
    .positive("Narx 0 dan katta bo'lishi kerak.")
    .max(100_000_000_000, "Narx juda katta kiritildi."),
  currency: z.enum(["USD", "UZS"]),
  rooms: z.coerce
    .number({ message: "Xonalar soni raqam bo'lishi kerak." })
    .int("Xonalar soni butun son bo'lishi kerak.")
    .min(1, "Kamida 1 ta xona bo'lishi kerak.")
    .max(30, "Xonalar soni 30 tadan oshmasligi kerak."),
  area_sqm: z.coerce
    .number({ message: "Maydon raqam bo'lishi kerak." })
    .min(5, "Umumiy maydon kamida 5 m² bo'lishi kerak.")
    .max(10000, "Maydon 10 000 m² dan oshmasligi kerak."),
  contact_phone: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(9, "Telefon raqami to'liq emas.")
        .max(22, "Telefon raqami juda uzun.")
        .regex(
          /^[+\d\s()-]{9,22}$/,
          "Telefon raqam formati noto'g'ri (masalan: +998 90 123 45 67)."
        )
    ),
  description: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(3000, "Tavsif 3000 ta belgidan oshmasligi kerak.")),
  amenities: z.array(z.string().transform(sanitizeText)),
  student_gender: z.enum(["boys", "girls", "any"]).nullable().optional(),
  available_spots: z.coerce
    .number()
    .int()
    .min(1, "Bo'sh joylar soni kamida 1 ta bo'lishi kerak.")
    .max(50, "Bo'sh joylar soni 50 tadan oshmasligi kerak.")
    .nullable()
    .optional(),
  near_university: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(150, "OTM nomi juda uzun."))
    .nullable()
    .optional(),
  with_owner: z.boolean().nullable().optional(),
});

export const inquiryFormSchema = z.object({
  senderName: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(2, "Ismingiz kamida 2 ta harfdan iborat bo'lishi kerak.")
        .max(60, "Ism juda uzun.")
    ),
  senderPhone: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(9, "Telefon raqamingizni to'g'ri kiriting.")
        .regex(/^[+\d\s()-]{9,22}$/, "Telefon raqam formati noto'g'ri.")
    ),
  messageText: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(5, "Xabar kamida 5 ta belgidan iborat bo'lishi kerak.")
        .max(1000, "Xabar 1000 ta belgidan oshmasligi kerak.")
    ),
});

