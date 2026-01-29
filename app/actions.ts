
'use server';

import { db, dbStatus } from '@/lib/db';
import { users, tasks, messages } from '@/db/schema';
import { eq, desc, asc, sql, and, gte } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

// --- Helper: Safe AI Initialization ---
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// --- SYSTEM HEALTH CHECK ---
export async function checkSystemHealthAction() {
  const status = {
    env: false,
    database: false,
    ai: false,
    message: ""
  };

  if (dbStatus.isConfigured) {
    status.env = true;
  } else {
    status.message = `Konfigurasi DB Error: ${dbStatus.error || "URL Missing"}`;
  }

  try {
    await db.run(sql`SELECT 1`);
    if (dbStatus.isConfigured) {
       status.database = true;
    } else {
       status.database = false; 
    }
  } catch (error: any) {
    console.error("Health Check DB Failed:", error);
    status.database = false;
    status.message = status.message || `Koneksi Database Gagal: ${error.message}`;
    return status; 
  }

  if (process.env.API_KEY) {
    status.ai = true;
  }

  if (status.database) {
    try {
       await initializeSystemAction();
    } catch (e) {
       console.error("Table Init Warning:", e);
    }
  }

  return status;
}

export async function checkTaskSafetyAction(title: string, description: string) {
  const ai = getAIClient();
  if (!ai) return { safe: true, reason: "AI Check Skipped (No API Key)" };
  const TIMEOUT_MS = 5000; 

  try {
    const aiCall = ai.models.generateContent({
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

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI_TIMEOUT")), TIMEOUT_MS)
    );

    const response: any = await Promise.race([aiCall, timeoutPromise]);
    
    const text = response.text || '{}';
    return JSON.parse(text);

  } catch (e: any) {
    console.error("AI Check Error/Timeout:", e.message);
    return { safe: true, reason: "AI Service Busy (Auto-Approved by System)" };
  }
}

// --- SYSTEM INITIALIZATION ---
export async function initializeSystemAction() {
  if (!dbStatus.isConfigured) {
    return { success: false, message: "Menggunakan In-Memory DB (Data tidak tersimpan)" };
  }

  try {
    // Users Table
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
        xp INTEGER DEFAULT 0 NOT NULL,
        task_quota INTEGER DEFAULT 5 NOT NULL,
        payment_method TEXT,
        payment_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Migration checks for user table updates
    try { await db.run(sql`ALTER TABLE users ADD COLUMN task_quota INTEGER DEFAULT 5`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE users ADD COLUMN payment_method TEXT`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE users ADD COLUMN payment_number TEXT`); } catch (e) {}

    // Tasks Table with Migration Checks for new columns
    try { await db.run(sql`ALTER TABLE tasks ADD COLUMN submission_url TEXT`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE tasks ADD COLUMN submission_note TEXT`); } catch (e) {}
    try { await db.run(sql`ALTER TABLE tasks ADD COLUMN deadline TEXT`); } catch (e) {}

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        budget INTEGER NOT NULL,
        deadline TEXT,
        status TEXT DEFAULT 'open' NOT NULL,
        client_id TEXT NOT NULL,
        freelancer_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        taken_at TEXT,
        submission_url TEXT,
        submission_note TEXT,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (freelancer_id) REFERENCES users(id)
      );
    `);

    // Messages Table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
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
  if (!userId) throw new Error("Unauthorized");

  if (!dbStatus.isConfigured) {
     throw new Error("Database belum terkoneksi.");
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
      xp: 0,
      taskQuota: 5, // Default Weekly Quota
      paymentMethod: null,
      paymentNumber: null
    };

    await db.insert(users).values(newUser);
    return { success: true, user: newUser };

  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(error.message || "Gagal mendaftar.");
  }
}

export async function updatePaymentDetailsAction(method: string, number: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(users)
    .set({ paymentMethod: method, paymentNumber: number } as any)
    .where(eq(users.id, user.id));
    
  return { success: true };
}

// --- Task Actions ---

export async function createTaskAction(title: string, description: string, budget: number, deadline: string) {
  const user = await syncUser();
  if (!user || user.role !== 'client') throw new Error("Unauthorized");

  const validDeadline = deadline && deadline.trim() !== '' ? deadline : null;

  await db.insert(tasks).values({
    id: uuidv4(),
    title,
    description,
    budget,
    deadline: validDeadline,
    clientId: user.id,
    status: 'open',
    freelancerId: null,
    takenAt: null,
    submissionUrl: null,
    submissionNote: null
  } as any);
  
  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  const user = await syncUser();
  if (!user || user.role !== 'client') throw new Error("Unauthorized");

  await db.delete(tasks).where(
    and(
      eq(tasks.id, taskId),
      eq(tasks.clientId, user.id)
    )
  );
  
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

export async function getWeeklyTaskCountAction(userId: string) {
  // Hitung tugas yang diambil 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString();

  try {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.freelancerId, userId),
          gte(tasks.takenAt, dateStr)
        )
      )
      .get();
    
    return result?.count || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export async function takeTaskAction(taskId: string, parentalCodeInput: string) {
  const user = await syncUser();
  if (!user || user.role !== 'freelancer') throw new Error("Unauthorized");

  // 1. Cek Rekening
  if (!user.paymentMethod || !user.paymentNumber) {
    throw new Error("Harap lengkapi detail pembayaran (Bank/E-Wallet) di profil sebelum mengambil tugas.");
  }

  // 2. Cek Kuota Mingguan
  const weeklyCount = await getWeeklyTaskCountAction(user.id);
  const maxQuota = user.taskQuota || 5;
  
  if (weeklyCount >= maxQuota) {
    throw new Error(`Kuota mingguan habis (${maxQuota}/${maxQuota}). Tunggu minggu depan ya!`);
  }

  // 3. Cek Parental Code
  if (user.parentalCode !== parentalCodeInput) {
    throw new Error("Kode Orang Tua Salah!");
  }
  
  await db.update(tasks)
    .set({ status: 'taken', freelancerId: user.id, takenAt: new Date().toISOString() } as any)
    .where(eq(tasks.id, taskId));
    
  return { success: true };
}

export async function submitTaskAction(taskId: string, submissionUrl: string, submissionNote: string) {
  const user = await syncUser();
  if (!user || user.role !== 'freelancer') throw new Error("Unauthorized");

  await db.update(tasks)
    .set({ 
      status: 'submitted', 
      submissionUrl, 
      submissionNote 
    } as any)
    .where(eq(tasks.id, taskId));

  await db.insert(messages).values({
    id: uuidv4(),
    taskId,
    senderId: user.id,
    content: `[SYSTEM] Tugas diserahkan.\nLink: ${submissionUrl}\nCatatan: ${submissionNote}`
  });

  return { success: true };
}

export async function completePaymentAction(taskId: string) {
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task || !task.freelancerId) return;

  await db.update(tasks).set({ status: 'completed' } as any).where(eq(tasks.id, taskId));
  
  const freelancer = await db.select().from(users).where(eq(users.id, task.freelancerId)).get();
  if(freelancer) {
      await db.update(users)
        .set({ 
          balance: freelancer.balance + task.budget,
          xp: (freelancer.xp || 0) + 100 
        } as any)
        .where(eq(users.id, task.freelancerId));
  }
  
  return { success: true };
}

// --- Chat Actions ---

export async function sendMessageAction(taskId: string, content: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  await db.insert(messages).values({
    id: uuidv4(),
    taskId,
    senderId: user.id,
    content
  });
  return { success: true };
}

export async function getMessagesAction(taskId: string) {
  try {
    const msgs = await db.select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderName: users.name,
      senderId: users.id
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.taskId, taskId))
    .orderBy(asc(messages.createdAt));
    
    return msgs;
  } catch (e) {
    return [];
  }
}
