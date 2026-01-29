export type Role = 'freelancer' | 'client' | 'parent';

export interface User {
  id: string;
  clerk_id: string; // Simulated Clerk ID
  role: Role;
  name: string;
  username: string;
  age?: number;
  parental_code?: string; // Only for freelancers
  balance: number;
  task_quota_daily: number;
}

export type TaskStatus = 'open' | 'taken' | 'submitted' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: TaskStatus;
  client_id: string;
  freelancer_id?: string;
  created_at: string; // ISO date string
  taken_at?: string;
}

// Simulated Session Context
export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}