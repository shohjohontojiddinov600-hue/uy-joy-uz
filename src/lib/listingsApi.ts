import { MOCK_LISTINGS } from "@/data/mockListings";
import { Listing, ListingStatus, ListingType, Profile, StudentGender } from "@/types/listing";
import { deletePropertyImages } from "./storage";
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
  near_university?: string | null;
  with_owner?: boolean | null;
  amenities: string[];
  images: string[];
  contact_phone: string;
}

function mapRowToListing(row: Record<string, unknown>): Listing {
  const category = row.category as ListingType;
  const city = String(row.city || "");
  const district = String(row.district || "");
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];

  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : undefined,
    category,
    title: String(row.title || ""),
    description: String(row.description || ""),
    price: Number(row.price),
    currency: ((row.currency as "USD" | "UZS") || "USD"),
    pricePeriod: category !== "sale" ? "oyiga" : undefined,
    city,
    district,
    address: district ? `${city}, ${district}` : city,
    rooms: Number(row.rooms),
    area_sqm: Number(row.area_sqm),
    student_gender: (row.student_gender as StudentGender | null) || null,
    available_spots:
      row.available_spots !== null && row.available_spots !== undefined
        ? Number(row.available_spots)
        : null,
    nearUniversity: row.near_university ? String(row.near_university) : undefined,
    with_owner:
      row.with_owner !== null && row.with_owner !== undefined
        ? Boolean(row.with_owner)
        : null,
    amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
    images:
      images.length > 0
        ? images
        : [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
          ],
    contact_phone: String(row.contact_phone || ""),
    status: (row.status as ListingStatus) || "active",
    created_at: row.created_at ? String(row.created_at) : undefined,
    isVerified: true,
  };
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

  return (data || []).map((row) => mapRowToListing(row as Record<string, unknown>));
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

  const basePayload = {
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
  };

  const extendedPayload =
    input.category === "student_dorm"
      ? {
          ...basePayload,
          near_university: input.near_university || null,
          with_owner: input.with_owner ?? false,
        }
      : basePayload;

  let { data, error } = await supabase
    .from("listings")
    .insert(extendedPayload)
    .select("*")
    .single();

  // Agar bazada near_university / with_owner ustunlari hali qo'shilmagan bo'lsa, asosiy ustunlar bilan saqlaymiz
  if (
    error &&
    input.category === "student_dorm" &&
    (error.message.includes("near_university") ||
      error.message.includes("with_owner") ||
      error.code === "PGRST204")
  ) {
    const retry = await supabase
      .from("listings")
      .insert(basePayload)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error(error?.message || "E'lonni saqlashda xatolik yuz berdi.");
  }

  return mapRowToListing(data as Record<string, unknown>);
}

export interface ListingDetailResult {
  listing: Listing;
  owner: Pick<Profile, "full_name" | "phone_number" | "created_at"> | null;
}

/**
 * ID bo'yicha bitta e'lonni (avval mocklardan, keyin Supabase'dan) va egasining profilini yuklaydi.
 */
export async function fetchListingById(
  id: string
): Promise<ListingDetailResult | null> {
  const mockMatch = MOCK_LISTINGS.find((item) => item.id === id);
  if (mockMatch) {
    return {
      listing: mockMatch,
      owner: {
        full_name: "UyJoy Tasdiqlangan Egasi",
        phone_number: mockMatch.contact_phone,
        created_at: "2025-09-15T00:00:00.000Z",
      },
    };
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const listing = mapRowToListing(data as Record<string, unknown>);

  let owner: Pick<Profile, "full_name" | "phone_number" | "created_at"> | null =
    null;

  if (listing.user_id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, phone_number, created_at")
      .eq("id", listing.user_id)
      .maybeSingle();

    if (profileData) {
      owner = {
        full_name: profileData.full_name || "Foydalanuvchi",
        phone_number: profileData.phone_number || listing.contact_phone,
        created_at: profileData.created_at,
      };
    }
  }

  return { listing, owner };
}

/**
 * Foydalanuvchining o'zi joylagan barcha e'lonlarni (active va sold) yuklaydi.
 */
export async function fetchUserListings(userId: string): Promise<Listing[]> {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapRowToListing(row as Record<string, unknown>));
}

/**
 * Berilgan ID ro'yxati bo'yicha saqlangan (sevimli) e'lonlarni yuklaydi.
 */
export async function fetchListingsByIds(ids: string[]): Promise<Listing[]> {
  if (ids.length === 0) return [];

  const mockMatches = MOCK_LISTINGS.filter((item) => ids.includes(item.id));
  const mockIds = new Set(mockMatches.map((m) => m.id));
  const remainingIds = ids.filter((id) => !mockIds.has(id));

  if (!supabase || remainingIds.length === 0) {
    return mockMatches;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("id", remainingIds);

  if (error) {
    return mockMatches;
  }

  const dbMatches = (data || []).map((row) =>
    mapRowToListing(row as Record<string, unknown>)
  );

  return [...dbMatches, ...mockMatches];
}

export type UpdateListingInput = Omit<CreateListingInput, "user_id" | "images"> & {
  images?: string[];
};

/**
 * E'lon ma'lumotlarini tahrirlash.
 */
export async function updateListingInDb(
  id: string,
  userId: string,
  input: UpdateListingInput
): Promise<Listing> {
  if (!supabase) {
    throw new Error("Supabase ulanmagan.");
  }

  const basePayload: Record<string, unknown> = {
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
    contact_phone: input.contact_phone,
  };

  if (input.images) {
    basePayload.images = input.images;
  }

  const extendedPayload =
    input.category === "student_dorm"
      ? {
          ...basePayload,
          near_university: input.near_university || null,
          with_owner: input.with_owner ?? false,
        }
      : {
          ...basePayload,
          near_university: null,
          with_owner: false,
        };

  let { data, error } = await supabase
    .from("listings")
    .update(extendedPayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (
    error &&
    (error.message.includes("near_university") ||
      error.message.includes("with_owner") ||
      error.code === "PGRST204")
  ) {
    const retry = await supabase
      .from("listings")
      .update(basePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error(error?.message || "E'lonni tahrirlashda xatolik.");
  }

  return mapRowToListing(data as Record<string, unknown>);
}

/**
 * E'lon holatini ('active' <-> 'sold') o'zgartirish.
 */
export async function updateListingStatusInDb(
  id: string,
  userId: string,
  status: ListingStatus
): Promise<Listing> {
  if (!supabase) {
    throw new Error("Supabase ulanmagan.");
  }

  const { data, error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Holatni yangilashda xatolik.");
  }

  return mapRowToListing(data as Record<string, unknown>);
}

/**
 * E'lonni Supabase'dan hamda uning rasmlarini Storage'dan o'chirish.
 */
export async function deleteListingInDb(
  id: string,
  userId: string,
  imageUrls: string[]
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase ulanmagan.");
  }

  if (imageUrls.length > 0) {
    await deletePropertyImages(imageUrls);
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message || "E'lonni o'chirishda xatolik.");
  }
}

