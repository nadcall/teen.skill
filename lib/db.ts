
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let client;
let isFallback = false;
let initError = "";

try {
  if (!url) {
    throw new Error("TURSO_DATABASE_URL tidak ditemukan di .env.local");
  }
  
  // Mencoba inisialisasi client
  // Jika URL tidak valid (misal kosong atau salah format), ini akan throw error
  client = createClient({
    url,
    authToken,
  });
} catch (error: any) {
  console.warn("⚠️ Gagal menginisialisasi Turso Client. Menggunakan In-Memory DB agar aplikasi tidak crash.");
  console.warn("Detail Error:", error.message);
  
  initError = error.message;
  isFallback = true;

  // Fallback ke in-memory agar aplikasi tetap jalan (walau data kosong)
  // Ini mencegah "Server Component Render Error" (White Screen of Death)
  client = createClient({
    url: ":memory:",
  });
}

export const db = drizzle(client, { schema });
export const dbStatus = {
  isConfigured: !isFallback,
  error: initError
};
