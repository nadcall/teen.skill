
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

  // --- AUTO FIX PROTOKOL ---
  // Error 400 sering terjadi karena library @libsql/client di lingkungan serverless
  // lebih stabil menggunakan protokol HTTPS daripada LIBSQL.
  // Kita ubah otomatis tanpa perlu ganti .env
  let connectionUrl = url;
  if (url.startsWith("libsql://")) {
    connectionUrl = url.replace("libsql://", "https://");
  }
  
  // Mencoba inisialisasi client
  client = createClient({
    url: connectionUrl,
    authToken,
  });
} catch (error: any) {
  console.warn("⚠️ Gagal menginisialisasi Turso Client. Menggunakan In-Memory DB agar aplikasi tidak crash.");
  console.warn("Detail Error:", error.message);
  
  initError = error.message;
  isFallback = true;

  // Fallback ke in-memory agar aplikasi tetap jalan (walau data kosong)
  client = createClient({
    url: ":memory:",
  });
}

export const db = drizzle(client, { schema });
export const dbStatus = {
  isConfigured: !isFallback,
  error: initError
};
