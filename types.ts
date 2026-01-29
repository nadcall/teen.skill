export type Role = 'freelancer' | 'client' | 'parent';

// Mengikuti struktur Drizzle Schema (CamelCase)
export interface User {
  id: string;
  clerkId: string; 
  role: Role;
  name: string;
  username: string;
  age?: number;
  parentalCode?: string;
  balance: number;
  taskQuotaDaily: number;
  createdAt?: string;
}

export type TaskStatus = 'open' | 'taken' | 'submitted' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: TaskStatus;
  clientId: string;
  freelancerId?: string;
  createdAt: string;
  takenAt?: string;
}