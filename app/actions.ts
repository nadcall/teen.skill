
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

// --- Database Setup Action (Darurat/First Run) ---
export async function setupDatabaseAction() {
  try {
    // Manual SQL Create Table untuk User yang tidak bisa akses terminal
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
    
    return { success: true, message: "Database berhasil dibuat!" };
  } catch (error: any) {
    console.error("Setup DB Error:", error);
    return { success: false, message: error.message };
  }
}

// --- User Actions ---

export async function syncUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("TURSO_DATABASE_URL belum dikonfigurasi di .env.local");
    }

    const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).get();
    return dbUser || null;
  } catch (error: any) {
    console.error("Sync User Error:", error);
    if (error.message && (error.message.includes("no such table") || error.message.includes("Prepare failed"))) {
      throw new Error("Tabel database belum ditemukan. Klik tombol perbaikan di bawah.");
    }
    throw error;
  }
}

export async function registerUserAction(formData: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
