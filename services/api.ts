import axios from 'axios';
import { Note, Reminder, Transaction, HealthLog, Habit, Account, SavingsGoal } from '../types';

// Use relative /api path in production (Vercel), localhost in development
const API_URL = import.meta.env.PROD
  ? '/api'  // Vercel serverless functions
  : 'http://localhost:3001/api';  // Local Express server

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface FinanceSummary {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
}

export interface HabitWithLogs extends Habit {
  logs: Array<{
    id: number;
    habit_id: number;
    date: string;
    completed: boolean;
    notes?: string;
  }>;
}

// Notes Service
export const NotesService = {
  getAll: async (): Promise<Note[]> => {
    const { data } = await api.get<Note[]>('/notes');
    return data;
  },
  getById: async (id: string): Promise<Note> => {
    const { data } = await api.get<Note>(`/notes/${id}`);
    return data;
  },
  create: async (note: Partial<Note>): Promise<Note> => {
    const { data } = await api.post<Note>('/notes', note);
    return data;
  },
  update: async (id: string, note: Partial<Note>): Promise<Note> => {
    const { data } = await api.put<Note>(`/notes/${id}`, note);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

// Reminders Service
export const RemindersService = {
  getAll: async (): Promise<Reminder[]> => {
    const { data } = await api.get<Reminder[]>('/reminders');
    // Transform API response to match frontend Reminder type
    return data.map((r: any) => ({
      ...r,
      dueDate: new Date(r.due_date),
      completed: r.status === 'completed',
    }));
  },
  getById: async (id: string): Promise<Reminder> => {
    const { data } = await api.get<Reminder>(`/reminders/${id}`);
    return { ...data, dueDate: new Date((data as any).due_date), completed: (data as any).status === 'completed' };
  },
  create: async (reminder: Partial<Reminder>): Promise<Reminder> => {
    const payload = {
      title: reminder.title,
      description: reminder.description,
      due_date: reminder.dueDate?.toISOString().split('T')[0],
      due_time: reminder.dueDate?.toTimeString().slice(0, 5),
      priority: reminder.priority || 'medium',
      category: reminder.category || 'general',
    };
    const { data } = await api.post<Reminder>('/reminders', payload);
    return { ...data, dueDate: new Date((data as any).due_date), completed: (data as any).status === 'completed' };
  },
  update: async (id: string, reminder: Partial<Reminder>): Promise<Reminder> => {
    const payload: any = { ...reminder };
    if (reminder.dueDate) {
      payload.due_date = reminder.dueDate.toISOString().split('T')[0];
      payload.due_time = reminder.dueDate.toTimeString().slice(0, 5);
      delete payload.dueDate;
    }
    if (reminder.completed !== undefined) {
      payload.status = reminder.completed ? 'completed' : 'pending';
      delete payload.completed;
    }
    const { data } = await api.put<Reminder>(`/reminders/${id}`, payload);
    return { ...data, dueDate: new Date((data as any).due_date), completed: (data as any).status === 'completed' };
  },
  toggleComplete: async (id: string): Promise<Reminder> => {
    const { data } = await api.patch<Reminder>(`/reminders/${id}/toggle`);
    return { ...data, dueDate: new Date((data as any).due_date), completed: (data as any).status === 'completed' };
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
};

// Habits Service
export const HabitsService = {
  getAll: async (): Promise<HabitWithLogs[]> => {
    const { data } = await api.get<HabitWithLogs[]>('/habits');
    return data;
  },
  getById: async (id: string): Promise<HabitWithLogs> => {
    const { data } = await api.get<HabitWithLogs>(`/habits/${id}`);
    return data;
  },
  create: async (habit: Partial<Habit>): Promise<HabitWithLogs> => {
    const { data } = await api.post<HabitWithLogs>('/habits', habit);
    return data;
  },
  update: async (id: string, habit: Partial<Habit>): Promise<Habit> => {
    const { data } = await api.put<Habit>(`/habits/${id}`, habit);
    return data;
  },
  logCompletion: async (id: string, date: string, completed: boolean, notes?: string): Promise<any> => {
    const { data } = await api.post(`/habits/${id}/log`, { date, completed, notes });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
};

// Finance Service
export const FinanceService = {
  getSummary: async (): Promise<FinanceSummary> => {
    const { data } = await api.get<FinanceSummary>('/finance/summary');
    return data;
  },
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await api.get<Account[]>('/finance/accounts');
    return data;
  },
  createAccount: async (account: Partial<Account>): Promise<Account> => {
    const { data } = await api.post<Account>('/finance/accounts', account);
    return data;
  },
  updateAccount: async (id: string, account: Partial<Account>): Promise<Account> => {
    const { data } = await api.put<Account>(`/finance/accounts/${id}`, account);
    return data;
  },
  getTransactions: async (): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>('/finance/transactions');
    // Transform API response to match frontend Transaction type
    return data.map((t: any) => ({
      ...t,
      date: new Date(t.date),
      account: t.accounts?.name || t.account_id,
    }));
  },
  createTransaction: async (tx: Partial<Transaction>): Promise<Transaction> => {
    const payload = {
      account_id: tx.account,
      type: tx.type,
      amount: tx.amount,
      description: tx.title,
      category_id: tx.category,
      date: tx.date?.toISOString(),
    };
    const { data } = await api.post<Transaction>('/finance/transactions', payload);
    return { ...data, date: new Date((data as any).date) };
  },
};

// Health Service
export const HealthService = {
  getLogs: async (): Promise<HealthLog[]> => {
    const { data } = await api.get<HealthLog[]>('/health/logs');
    // Transform API response to match frontend HealthLog type
    return data.map((log: any) => ({
      id: log.id.toString(),
      type: log.health_metrics?.name?.toLowerCase() || 'weight',
      value: log.value,
      date: new Date(log.date),
      note: log.notes,
    }));
  },
  getMetrics: async (): Promise<any[]> => {
    const { data } = await api.get('/health/metrics');
    return data;
  },
  getGoals: async (): Promise<any[]> => {
    const { data } = await api.get('/health/goals');
    return data;
  },
  logEntry: async (entry: { metric_id: number; value: number; date?: string; notes?: string }): Promise<HealthLog> => {
    const { data } = await api.post<HealthLog>('/health/logs', entry);
    return data;
  },
  updateLog: async (id: string, entry: Partial<HealthLog>): Promise<HealthLog> => {
    const { data } = await api.put<HealthLog>(`/health/logs/${id}`, entry);
    return data;
  },
  deleteLog: async (id: string): Promise<void> => {
    await api.delete(`/health/logs/${id}`);
  },
  createGoal: async (goal: { metric_id: number; target_value: number; target_date: string; name: string }): Promise<any> => {
    const { data } = await api.post('/health/goals', goal);
    return data;
  },
};

export default api;
