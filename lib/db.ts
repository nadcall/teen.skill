
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("ERROR FATAL: TURSO_DATABASE_URL tidak ditemukan di Environment Variables.");
}

// Gunakan fallback agar build tidak crash, tapi berikan error saat query dijalankan jika URL invalid
const client = createClient({
  url: url || "libsql://db-placeholder.turso.io", 
  authToken: authToken,
});

export const db = drizzle(client, { schema });
