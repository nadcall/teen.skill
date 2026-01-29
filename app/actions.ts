
'use server';

import { db } from '@/lib/db';
import { users, tasks } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

// --- Gemini AI ---
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function checkTaskSafetyAction(title: string, description: string) {
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
    // Fail safe: izinkan tapi log error, atau tolak demi keamanan
    return { safe: true, reason: "AI Service Unavailable (Auto-Approved)" };
  }
}

// --- Internal Helper: Setup Tables Automatically ---
async function ensureTablesExist() {
  try {
    // Cek koneksi dulu dengan query ringan
    try {
       await db.run(sql`SELECT 1`);
    } catch (connError) {
       console.error("Database connection failed:", connError);
       throw new Error("Koneksi Database Gagal. Cek Environment Variables di Vercel.");
    }

    // Create Users Table
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

    // Create Tasks Table
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
    console.log("Database tables verified/created successfully.");
  } catch (error: any) {
    console.error("Failed to auto-create tables:", error);
    // Jangan throw error di sini agar aplikasi tidak crash total, biarkan action lain yang handle
  }
}

// --- User Actions ---

export async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    if (!process.env.TURSO_DATABASE_URL) {
      console.error("Missing TURSO_DATABASE_URL");
      return null;
    }

    // 1. Coba ambil user
    try {
      const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();
      return dbUser || null;
    } catch (queryError: any) {
      // 2. Jika error karena tabel tidak ada, buat tabelnya
      if (queryError.message && (queryError.message.includes("no such table") || queryError.message.includes("Prepare failed"))) {
        console.log("Tables missing. Creating tables...");
        await ensureTablesExist();
        return null; // Return null agar user diarahkan ke Onboarding
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error("Sync User Error:", error);
    return null; 
  }
}

export async function registerUserAction(formData: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: Tidak ada sesi login.");

  try {
    // Pastikan tabel ada sebelum insert
    await ensureTablesExist();

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

    // Insert ke Database
    await db.insert(users).values(newUser);
    
    // PENTING: Jangan gunakan revalidatePath('/') di sini jika menyebabkan error render di Vercel.
    // Kita return success flag, biar Client yang reload page.
    return { success: true, user: newUser };

  } catch (error: any) {
    console.error("Register Error Detailed:", error);
    // Return error message yang bisa dibaca user
    throw new Error(error.message || "Gagal mendaftarkan user ke database.");
  }
}

// --- Task Actions ---

export async function createTaskAction(title: string, description: string, budget: number) {
  const user = await syncUser();
  if (!user || user.role !== 'client') throw new Error("Unauthorized");

  await db.insert(tasks).values({
    id: uuidv4(),
    title,
    description,
    budget,
    clientId: user.id,
    status: 'open'
  });
  // Return simple success object
  return { success: true };
}

export async function getOpenTasksAction() {
  try {
    await ensureTablesExist(); 
    return await db.select().from(tasks).where(eq(tasks.status, 'open')).orderBy(desc(tasks.createdAt));
  } catch (e) {
    console.error("Get Open Tasks Error:", e);
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
    console.error("Get My Tasks Error:", e);
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
