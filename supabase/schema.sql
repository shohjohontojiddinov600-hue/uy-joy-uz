-- ============================================================================
-- UyJoy.uz — Supabase Ma'lumotlar Bazasi Sxemasi, RLS va Storage Qoidalari
-- Ushbu kodni Supabase Dashboard -> SQL Editor ga tashlab ishga tushiring.
-- ============================================================================

-- 1. PROFILES JADVALI
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles uchun RLS yoqish
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hamma profillarni o'qiy oladi (masalan, e'lon egasi ismi)
CREATE POLICY "Profillarni hamma ko'ra oladi"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Foydalanuvchi faqat o'z profilini yarata oladi
CREATE POLICY "Foydalanuvchi o'z profilini yarata oladi"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Foydalanuvchi faqat o'z profilini tahrirlay oladi
CREATE POLICY "Foydalanuvchi o'z profilini tahrirlay oladi"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Yangi foydalanuvchi ro'yxatdan o'tganda avtomatik profile yaratuvchi trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. LISTINGS JADVALI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('sale', 'rent', 'student_dorm')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'UZS')),
  city TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  rooms INT NOT NULL DEFAULT 1 CHECK (rooms >= 1),
  area_sqm NUMERIC NOT NULL CHECK (area_sqm > 0),
  student_gender TEXT CHECK (student_gender IS NULL OR student_gender IN ('boys', 'girls', 'any')),
  available_spots INT CHECK (available_spots IS NULL OR available_spots >= 0),
  near_university TEXT,
  with_owner BOOLEAN DEFAULT FALSE,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  contact_phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tezkor qidiruv va filtrlash uchun indekslar
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- Listings uchun RLS yoqish
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Hamma 'active' e'lonlarni ko'ra oladi; muallif esa o'zining barcha e'lonlarini ko'ra oladi
CREATE POLICY "Active e'lonlarni hamma ko'ra oladi"
  ON public.listings
  FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

-- Faqat ro'yxatdan o'tgan foydalanuvchi o'z nomidan e'lon qo'sha oladi
CREATE POLICY "Ro'yxatdan o'tgan foydalanuvchi e'lon qo'sha oladi"
  ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Faqat e'lon egasi o'z e'lonini tahrirlay oladi
CREATE POLICY "Foydalanuvchi faqat o'z e'lonini tahrirlay oladi"
  ON public.listings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Faqat e'lon egasi o'z e'lonini o'chira oladi
CREATE POLICY "Foydalanuvchi faqat o'z e'lonini o'chira oladi"
  ON public.listings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. SUPABASE STORAGE: 'property-images' PUBLIC BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Hamma rasmlarni ko'ra oladi
CREATE POLICY "Property rasmlarini hamma ko'ra oladi"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

-- Faqat ro'yxatdan o'tgan foydalanuvchi rasm yuklay oladi
CREATE POLICY "Ro'yxatdan o'tgan foydalanuvchi rasm yuklay oladi"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Foydalanuvchi faqat o'zi yuklagan rasmni o'chira oladi
CREATE POLICY "Foydalanuvchi o'z rasmini o'chira oladi"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.uid() = owner
  );

-- Mavjud jadvallarga yangi ustunlarni qo'shish (agar oldin yaratilgan bo'lsa)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS near_university TEXT,
  ADD COLUMN IF NOT EXISTS with_owner BOOLEAN DEFAULT FALSE;

