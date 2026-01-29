
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
    return { safe: true, reason: "AI Service Unavailable (Auto-Approved)" };
  }
}

// --- SYSTEM INITIALIZATION (PENTING: Dijalankan saat Splash Screen) ---
export async function initializeSystemAction() {
  console.log("🚀 System Initialization Started...");
  
  if (!process.env.TURSO_DATABASE_URL) {
    return { success: false, message: "Database URL not configured" };
  }

  try {
    // 1. Cek Koneksi & Buat Tabel Users
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

    // 2. Buat Tabel Tasks
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

    console.log("✅ System Initialization Complete: Tables Ready.");
    return { success: true, message: "System Ready" };
  } catch (error: any) {
    console.error("❌ System Init Failed:", error);
    return { success: false, message: error.message };
  }
}

// --- User Actions ---

export async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // Karena initializeSystemAction sudah dijalankan di awal, 
    // kita bisa langsung query tanpa try-catch berlebihan untuk create table.
    const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();
    return dbUser || null;
    
  } catch (error: any) {
    console.error("Sync User Error:", error);
    return null; 
  }
}

export async function registerUserAction(formData: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: Tidak ada sesi login.");

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

  await db.insert(tasks).values({
    id: uuidv4(),
    title,
    description,
    budget,
    clientId: user.id,
    status: 'open'
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
