export type ListingCategory = "all" | "sale" | "rent" | "student_dorm";

export type ListingType = "sale" | "rent" | "student_dorm";

export type Currency = "USD" | "UZS";

export type StudentGender = "boys" | "girls" | "any";

export type ListingStatus = "active" | "sold";

export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Listing {
  id: string;
  user_id?: string;
  title: string;
  category: ListingType;
  description: string;
  price: number;
  currency: Currency;
  pricePeriod?: string; // e.g. "oyiga" for rent/student_dorm
  city: string;
  district: string;
  address?: string;
  area_sqm: number; // m²
  rooms: number;
  floor?: string;
  student_gender?: StudentGender | null;
  available_spots?: number | null;
  amenities: string[];
  images: string[];
  contact_phone: string;
  status: ListingStatus;
  created_at?: string;
  isVerified?: boolean;
  nearUniversity?: string;
}

export interface FilterState {
  category: ListingCategory;
  city: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  searchQuery: string;
}
