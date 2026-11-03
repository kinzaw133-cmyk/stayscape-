import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "stayscape.db");

// Singleton connection for sqlite in node process
let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initTables(_db);
  }
  return _db;
}

function initTables(database: DatabaseSync) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      hotel_slug TEXT NOT NULL,
      hotel_name TEXT NOT NULL,
      hotel_city TEXT NOT NULL,
      hotel_country TEXT NOT NULL,
      hotel_image TEXT NOT NULL,
      room_id TEXT NOT NULL,
      room_name TEXT NOT NULL,
      room_price REAL NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL,
      nights INTEGER NOT NULL,
      total_price REAL NOT NULL,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_hotel ON bookings(hotel_slug);
  `);
}

// User types
export type DbUser = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type DbUserWithSecrets = DbUser & {
  password_hash: string;
  salt: string;
};

export type DbBooking = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  hotel_slug: string;
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
  hotel_image: string;
  room_id: string;
  room_name: string;
  room_price: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  special_requests: string | null;
  status: "confirmed" | "cancelled";
  created_at: string;
};

// Password security helpers
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const check = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(check, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// User CRUD
export function createUser(name: string, email: string, password: string): DbUser {
  const db = getDb();
  const id = crypto.randomUUID();
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, salt, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, name.trim(), email.trim().toLowerCase(), hash, salt, now);

  return { id, name: name.trim(), email: email.trim().toLowerCase(), created_at: now };
}

export function getUserByEmail(email: string): DbUserWithSecrets | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE");
  const row = stmt.get(email.trim().toLowerCase()) as unknown as DbUserWithSecrets | undefined;
  return row ?? null;
}

export function getUserById(id: string): DbUser | null {
  const db = getDb();
  const stmt = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
  const row = stmt.get(id) as unknown as DbUser | undefined;
  return row ?? null;
}

// Session management
export function createSession(userId: string): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 days
  const now = new Date().toISOString();

  const stmt = db.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)");
  stmt.run(token, userId, expiresAt, now);
  return token;
}

export function getUserBySession(token: string): DbUser | null {
  if (!token) return null;
  const db = getDb();
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `);
  const row = stmt.get(token) as unknown as DbUser | undefined;
  return row ?? null;
}

export function deleteSession(token: string): void {
  if (!token) return;
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE id = ?");
  stmt.run(token);
}

// Booking CRUD
export type NewBookingInput = {
  userId: string;
  userName: string;
  userEmail: string;
  hotelSlug: string;
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  hotelImage: string;
  roomId: string;
  roomName: string;
  roomPrice: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  specialRequests?: string;
};

export function createBooking(data: NewBookingInput): DbBooking {
  const db = getDb();
  const refCode = "BK-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO bookings (
      id, user_id, user_name, user_email,
      hotel_slug, hotel_name, hotel_city, hotel_country, hotel_image,
      room_id, room_name, room_price,
      check_in, check_out, guests, nights, total_price, special_requests,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `);

  stmt.run(
    refCode,
    data.userId,
    data.userName,
    data.userEmail,
    data.hotelSlug,
    data.hotelName,
    data.hotelCity,
    data.hotelCountry,
    data.hotelImage,
    data.roomId,
    data.roomName,
    data.roomPrice,
    data.checkIn,
    data.checkOut,
    data.guests,
    data.nights,
    data.totalPrice,
    data.specialRequests || null,
    now,
  );

  return {
    id: refCode,
    user_id: data.userId,
    user_name: data.userName,
    user_email: data.userEmail,
    hotel_slug: data.hotelSlug,
    hotel_name: data.hotelName,
    hotel_city: data.hotelCity,
    hotel_country: data.hotelCountry,
    hotel_image: data.hotelImage,
    room_id: data.roomId,
    room_name: data.roomName,
    room_price: data.roomPrice,
    check_in: data.checkIn,
    check_out: data.checkOut,
    guests: data.guests,
    nights: data.nights,
    total_price: data.totalPrice,
    special_requests: data.specialRequests || null,
    status: "confirmed",
    created_at: now,
  };
}

export function getUserBookings(userId: string): DbBooking[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC");
  const rows = stmt.all(userId) as unknown as DbBooking[];
  return rows ?? [];
}

export function getBookingById(bookingId: string): DbBooking | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  const row = stmt.get(bookingId) as unknown as DbBooking | undefined;
  return row ?? null;
}

export function cancelBooking(bookingId: string, userId: string): boolean {
  const db = getDb();
  const stmt = db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?");
  stmt.run(bookingId, userId);
  return true;
}

