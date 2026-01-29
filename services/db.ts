import { User, Task, Role } from '../types';

const USERS_KEY = 'teenskill_users';
const TASKS_KEY = 'teenskill_tasks';
const CURRENT_USER_KEY = 'teenskill_current_user_id';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User Logic ---

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = async (): Promise<User | null> => {
  await delay(300); // Simulate network
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const loginUser = async (username: string, role: Role, parentalCode?: string): Promise<User> => {
  await delay(600);
  const users = getUsers();
  
  // Find user by username AND role to prevent confusion
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.role === role);

  if (!user) {
    throw new Error("Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.");
  }

  // CRITICAL: Parental Code Check for Freelancers (Students)
  if (role === 'freelancer') {
    if (!parentalCode) {
      throw new Error("Kode Orang Tua wajib diisi untuk login siswa.");
    }
    if (user.parental_code !== parentalCode) {
      throw new Error("Kode Orang Tua salah! Akses ditolak.");
    }
  }

  // Set session
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
};

export const registerUser = async (
  name: string,
  username: string,
  role: Role,
  age: number,
  parental_code?: string
): Promise<User> => {
  await delay(800);
  
  const users = getUsers();
  if (users.some(u => u.username === username)) {
    throw new Error("Username sudah digunakan.");
  }

  // Validation Logic
  if (role === 'freelancer') {
    if (age < 13 || age > 17) {
      throw new Error("Siswa harus berusia antara 13 dan 17 tahun.");
    }
    if (!parental_code) {
      throw new Error("Kode persetujuan orang tua diperlukan untuk pendaftaran siswa.");
    }
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    clerk_id: `user_${Math.random().toString(36).substr(2, 9)}`,
    name,
    username,
    role,
    age,
    parental_code, // Stored for login verification later
    balance: 0,
    task_quota_daily: 1, 
  };

  saveUser(newUser);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  return newUser;
};

// --- Task Logic ---

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTask = (task: Task) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.push(task);
  }
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const createTask = async (client: User, title: string, description: string, budget: number): Promise<Task> => {
  await delay(500);
  if (client.role !== 'client') throw new Error("Hanya klien yang dapat memposting tugas.");

  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    description,
    budget,
    status: 'open',
    client_id: client.id,
    created_at: new Date().toISOString(),
  };

  saveTask(newTask);
  return newTask;
};

export const takeTask = async (freelancer: User, taskId: string, parentalCodeInput: string): Promise<Task> => {
  await delay(600);
  
  if (freelancer.role !== 'freelancer') throw new Error("Hanya siswa yang dapat mengambil tugas.");

  // Double Check Parental Code (Safety Layer 2)
  if (freelancer.parental_code !== parentalCodeInput) {
    throw new Error("Kode Orang Tua tidak valid. Izin mengambil tugas ditolak.");
  }

  // Check Quota
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];
  const tasksTakenToday = tasks.filter(t => 
    t.freelancer_id === freelancer.id && 
    t.taken_at && 
    t.taken_at.startsWith(today)
  ).length;

  if (tasksTakenToday >= freelancer.task_quota_daily) {
    throw new Error(`Kuota harian tercapai. Batas: ${freelancer.task_quota_daily} tugas/hari.`);
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Tugas tidak ditemukan");
  
  const task = tasks[taskIndex];
  if (task.status !== 'open') throw new Error("Tugas sudah diambil orang lain.");

  const updatedTask: Task = {
    ...task,
    status: 'taken',
    freelancer_id: freelancer.id,
    taken_at: new Date().toISOString(),
  };

  saveTask(updatedTask);
  return updatedTask;
};

export const completeTaskPayment = async (taskId: string): Promise<Task> => {
  await delay(1500);

  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Tugas tidak ditemukan");

  const task = tasks[taskIndex];

  const updatedTask: Task = {
    ...task,
    status: 'completed'
  };
  saveTask(updatedTask);

  if (task.freelancer_id) {
    const users = getUsers();
    const freelancerIndex = users.findIndex(u => u.id === task.freelancer_id);
    if (freelancerIndex >= 0) {
      const freelancer = users[freelancerIndex];
      const updatedFreelancer = {
        ...freelancer,
        balance: freelancer.balance + task.budget
      };
      saveUser(updatedFreelancer);
    }
  }

  return updatedTask;
};

export const getAllOpenTasks = async (): Promise<Task[]> => {
  await delay(300);
  return getTasks().filter(t => t.status === 'open');
};

export const getMyTasks = async (userId: string, role: Role): Promise<Task[]> => {
  await delay(300);
  const allTasks = getTasks();
  if (role === 'client') {
    return allTasks.filter(t => t.client_id === userId);
  } else {
    return allTasks.filter(t => t.freelancer_id === userId);
  }
};