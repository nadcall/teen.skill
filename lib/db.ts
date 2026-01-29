
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.warn("PERINGATAN: TURSO_DATABASE_URL tidak ditemukan di .env.local. Koneksi database akan gagal.");
}

const client = createClient({
  url: url || "libsql://placeholder-db.turso.io", // Fallback agar build tidak crash, tapi runtime akan error jika query
  authToken: authToken,
});

export const db = drizzle(client, { schema });
