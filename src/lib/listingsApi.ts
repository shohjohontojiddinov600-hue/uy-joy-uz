import { Listing, ListingStatus, ListingType, StudentGender } from "@/types/listing";
import { supabase } from "./supabase";

export interface CreateListingInput {
  user_id: string;
  category: ListingType;
  title: string;
  description: string;
  price: number;
  currency: "USD" | "UZS";
  city: string;
  district: string;
  rooms: number;
  area_sqm: number;
  student_gender?: StudentGender | null;
  available_spots?: number | null;
  amenities: string[];
  images: string[];
  contact_phone: string;
}

/**
 * Supabase'dan barcha 'active' e'lonlarni yuklaydi.
 */
export async function fetchActiveListings(): Promise<Listing[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("E'lonlarni yuklashda xatolik:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    category: row.category as ListingType,
    title: row.title,
    description: row.description || "",
    price: Number(row.price),
    currency: (row.currency as "USD" | "UZS") || "USD",
    pricePeriod: row.category !== "sale" ? "oyiga" : undefined,
    city: row.city,
    district: row.district || "",
    address: row.district ? `${row.city}, ${row.district}` : row.city,
    rooms: Number(row.rooms),
    area_sqm: Number(row.area_sqm),
    student_gender: (row.student_gender as StudentGender | null) || null,
    available_spots:
      row.available_spots !== null && row.available_spots !== undefined
        ? Number(row.available_spots)
        : null,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    images:
      Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
          ],
    contact_phone: row.contact_phone || "",
    status: (row.status as ListingStatus) || "active",
    created_at: row.created_at,
    isVerified: true,
  }));
}

/**
 * Yangi e'lonni Supabase 'listings' jadvaliga qo'shadi.
 */
export async function createListingInDb(
  input: CreateListingInput
): Promise<Listing> {
  if (!supabase) {
    throw new Error("Supabase ulanmagan.");
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: input.user_id,
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      city: input.city,
      district: input.district,
      rooms: input.rooms,
      area_sqm: input.area_sqm,
      student_gender:
        input.category === "student_dorm" ? input.student_gender || "any" : null,
      available_spots:
        input.category === "student_dorm" ? input.available_spots ?? 1 : null,
      amenities: input.amenities,
      images: input.images,
      contact_phone: input.contact_phone,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "E'lonni saqlashda xatolik yuz berdi.");
  }

  return {
    id: data.id,
    user_id: data.user_id,
    category: data.category as ListingType,
    title: data.title,
    description: data.description || "",
    price: Number(data.price),
    currency: data.currency as "USD" | "UZS",
    pricePeriod: data.category !== "sale" ? "oyiga" : undefined,
    city: data.city,
    district: data.district || "",
    address: data.district ? `${data.city}, ${data.district}` : data.city,
    rooms: Number(data.rooms),
    area_sqm: Number(data.area_sqm),
    student_gender: data.student_gender as StudentGender | null,
    available_spots: data.available_spots,
    amenities: data.amenities || [],
    images: data.images || [],
    contact_phone: data.contact_phone || "",
    status: data.status as ListingStatus,
    created_at: data.created_at,
    isVerified: true,
  };
}

