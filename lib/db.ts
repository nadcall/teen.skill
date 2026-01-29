
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Fungsi helper untuk membuat client yang aman
const createSafeClient = () => {
  if (!url) {
    console.warn("PERINGATAN: TURSO_DATABASE_URL tidak ditemukan. Menggunakan Mock Client agar tidak crash.");
    // Return dummy client yang tidak akan crash saat di-import, tapi akan error saat query
    return createClient({
      url: "file:local.db", // Fallback aman yang tidak request network
    });
  }

  return createClient({
    url,
    authToken,
  });
};

const client = createSafeClient();

export const db = drizzle(client, { schema });
