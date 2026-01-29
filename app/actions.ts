
'use server';

import { db } from '@/lib/db';
import { users, tasks } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
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
    return { safe: true, reason: "AI Service Unavailable" };
  }
}

// --- Internal Helper: Setup Tables Automatically ---
async function ensureTablesExist() {
  try {
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
  } catch (error) {
    console.error("Failed to auto-create tables:", error);
  }
}

// --- User Actions ---

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  if (!process.env.TURSO_DATABASE_URL) {
    console.error("Missing TURSO_DATABASE_URL");
    return null;
  }

  try {
    // 1. Coba ambil user langsung (Jalur Cepat)
    const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();
    return dbUser || null;
  } catch (error: any) {
    // 2. Jika error karena tabel tidak ada, kita buatkan otomatis (Auto-Heal)
    if (error.message && (error.message.includes("no such table") || error.message.includes("Prepare failed"))) {
      console.log("Tables missing detected. Auto-healing...");
      await ensureTablesExist();
      
      // 3. Coba ambil user lagi setelah tabel dibuat
      try {
        const dbUserRetry = await db.select().from(users).where(eq(users.clerkId, userId)).get();
        return dbUserRetry || null;
      } catch (retryError) {
        console.error("Retry sync failed:", retryError);
        return null;
      }
    }
    console.error("Sync User Error:", error);
    return null; // Return null agar frontend tidak crash, bisa tampilkan Onboarding/Loading
  }
}

// Action manual ini masih disimpan sebagai cadangan, tapi jarang dipanggil
export async function setupDatabaseAction() {
  await ensureTablesExist();
  return { success: true, message: "Database siap!" };
}

export async function registerUserAction(formData: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Pastikan tabel ada sebelum insert (jaga-jaga)
  await ensureTablesExist();

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
    revalidatePath('/');
    return newUser;
  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(error.message || "Gagal mendaftarkan user.");
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
  revalidatePath('/');
}

export async function getOpenTasksAction() {
  try {
    // Pastikan tabel ada agar tidak error saat fetching
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
    
  revalidatePath('/');
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

  revalidatePath('/');
}
