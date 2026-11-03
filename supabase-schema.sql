-- StayScape Database Schema for Supabase
-- If you choose to connect Supabase, run this in your Supabase SQL Editor.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  hotel_slug TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_city TEXT NOT NULL,
  hotel_country TEXT NOT NULL,
  hotel_image TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  room_price NUMERIC NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_supabase_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_supabase_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_supabase_bookings_hotel ON public.bookings(hotel_slug);

