
'use server';

import { db, dbStatus } from '@/lib/db';
import { users, tasks } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

// --- Helper: Safe AI Initialization ---
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// --- SYSTEM HEALTH CHECK (DIAGNOSTIK) ---
export async function checkSystemHealthAction() {
  const status = {
    env: false,
    database: false,
    ai: false,
    message: ""
  };

  // 1. Cek Apakah Config DB Loaded (Dari lib/db.ts)
  if (dbStatus.isConfigured) {
    status.env = true;
  } else {
    status.message = `Konfigurasi DB Error: ${dbStatus.error || "URL Missing"}`;
    // Jangan return dulu, biarkan cek koneksi berjalan untuk memastikan
  }

  // 2. Cek Koneksi Database Real (Ping)
  try {
    // Jalankan query ringan
    await db.run(sql`SELECT 1`);
    
    // Jika kita dalam mode fallback (in-memory), SELECT 1 akan sukses, 
    // tapi itu bukan koneksi Turso yang asli.
    if (dbStatus.isConfigured) {
       status.database = true;
    } else {
       // Env error, tapi query sukses (berarti connect ke :memory:)
       status.database = false; 
    }
  } catch (error: any) {
    console.error("Health Check DB Failed:", error);
    status.database = false;
    status.message = status.message || `Koneksi Database Gagal: ${error.message}`;
    return status; 
  }

  // 3. Cek AI (Optional)
  if (process.env.API_KEY) {
    status.ai = true;
  }

  // 4. Jika Database OK, Pastikan Tabel Ada (Auto-Migration)
  if (status.database) {
    try {
       await initializeSystemAction();
    } catch (e) {
       console.error("Table Init Warning:", e);
       // Lanjut saja
    }
  }

  return status;
}

export async function checkTaskSafetyAction(title: string, description: string) {
  const ai = getAIClient();
  if (!ai) return { safe: true, reason: "AI Check Skipped (No API Key)" };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analisis deskripsi tugas freelance untuk remaja (13-17 thn).
        Judul: ${title}
        Deskripsi: ${description}
        
        Apakah tugas ini aman? Tugas TIDAK AMAN jika mengandung:
        - Pertemuan fisik privat (bahaya predator).
        - Konten dewasa/ilegal.
        - Penipuan/skema cepat kaya.
        
        Output JSON Only: { "safe": boolean, "reason": "alasan singkat bahasa indonesia" }
      `,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Check Error:", e);
    return { safe: true, reason: "AI Service Unavailable (Auto-Approved)" };
  }
}

// --- SYSTEM INITIALIZATION ---
export async function initializeSystemAction() {
  if (!dbStatus.isConfigured) {
    return { success: false, message: "Menggunakan In-Memory DB (Data tidak tersimpan)" };
  }

  try {
    // 1. Users Table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        clerk_id TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        age INTEGER,
        parental_code TEXT,
        balance INTEGER DEFAULT 0 NOT NULL,
        task_quota_daily INTEGER DEFAULT 1 NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tasks Table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        budget INTEGER NOT NULL,
        status TEXT DEFAULT 'open' NOT NULL,
        client_id TEXT NOT NULL,
        freelancer_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        taken_at TEXT,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (freelancer_id) REFERENCES users(id)
      );
    `);

    return { success: true, message: "System Ready" };
  } catch (error: any) {
    console.error("Init Tables Failed:", error);
    throw new Error(error.message);
  }
}

// --- User Actions ---

export async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    try {
      const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();
      return dbUser || null;
    } catch (dbError) {
      console.error("SyncUser DB Error:", dbError);
      return null;
    }
  } catch (authError) {
    console.error("SyncUser Auth Error:", authError);
    return null; 
  }
}

export async function registerUserAction(formData: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: Tidak ada sesi login.");

  // Validasi manual sebelum insert
  if (!dbStatus.isConfigured) {
     throw new Error("Database belum terkoneksi. Cek konfigurasi server.");
  }

  try {
    const newUser = {
      id: uuidv4(),
      clerkId: userId,
      name: formData.name,
      username: formData.username,
      role: formData.role,
      age: parseInt(formData.age) || 0,
      parentalCode: formData.parentalCode || null,
      balance: 0,
      taskQuotaDaily: 1,
    };

    await db.insert(users).values(newUser);
    return { success: true, user: newUser };

  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(error.message || "Gagal mendaftar.");
  }
}

// --- Task Actions ---

export async function createTaskAction(title: string, description: string, budget: number) {
  const user = await syncUser();
  if (!user || user.role !== 'client') throw new Error("Unauthorized");

  // FIX: Menghapus 'status' dari sini karena di schema sudah .default("open")
  // Drizzle akan otomatis mengisinya.
  await db.insert(tasks).values({
    id: uuidv4(),
    title,
    description,
    budget,
    clientId: user.id
  });
  return { success: true };
}

export async function getOpenTasksAction() {
  try {
    return await db.select().from(tasks).where(eq(tasks.status, 'open')).orderBy(desc(tasks.createdAt));
  } catch (e) {
    return [];
  }
}

export async function getMyTasksAction(userId: string, role: string) {
  try {
    if (role === 'client') {
      return await db.select().from(tasks).where(eq(tasks.clientId, userId)).orderBy(desc(tasks.createdAt));
    } else {
      return await db.select().from(tasks).where(eq(tasks.freelancerId, userId)).orderBy(desc(tasks.createdAt));
    }
  } catch (e) {
    return [];
  }
}

export async function takeTaskAction(taskId: string, parentalCodeInput: string) {
  const user = await syncUser();
  if (!user || user.role !== 'freelancer') throw new Error("Unauthorized");

  if (user.parentalCode !== parentalCodeInput) {
    throw new Error("Kode Orang Tua Salah!");
  }
  
  await db.update(tasks)
    .set({ status: 'taken', freelancerId: user.id, takenAt: new Date().toISOString() })
    .where(eq(tasks.id, taskId));
    
  return { success: true };
}

export async function completePaymentAction(taskId: string) {
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task || !task.freelancerId) return;

  await db.update(tasks).set({ status: 'completed' }).where(eq(tasks.id, taskId));
  
  const freelancer = await db.select().from(users).where(eq(users.id, task.freelancerId)).get();
  if(freelancer) {
      await db.update(users)
        .set({ balance: freelancer.balance + task.budget })
        .where(eq(users.id, task.freelancerId));
  }
  
  return { success: true };
}
