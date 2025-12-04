import axios from 'axios';
import { Note, Reminder, Transaction, HealthLog, Habit, Account, SavingsGoal, CalendarEvent, Dua, User } from '../types';

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
  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/finance/accounts/${id}`);
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
  getTransactionById: async (id: string): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/finance/transactions/${id}`);
    return { ...data, date: new Date((data as any).date) };
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
  updateTransaction: async (id: string, tx: Partial<Transaction>): Promise<Transaction> => {
    const { data } = await api.put<Transaction>(`/finance/transactions/${id}`, tx);
    return { ...data, date: new Date((data as any).date) };
  },
  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/finance/transactions/${id}`);
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

// Calendar Service
export const CalendarService = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const { data } = await api.get<CalendarEvent[]>('/calendar');
    return data.map((event: any) => ({
      ...event,
      date: new Date(event.date),
    }));
  },
  create: async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data } = await api.post<CalendarEvent>('/calendar', event);
    return { ...data, date: new Date(data.date) };
  },
  update: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data } = await api.put<CalendarEvent>(`/calendar/${id}`, event);
    return { ...data, date: new Date(data.date) };
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/${id}`);
  },
};

// Quran Service
export const QuranService = {
    getEditions: async (): Promise<any> => {
        const { data } = await axios.get('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.json');
        return data;
    },
    getChapter: async (edition: string, chapter: number): Promise<any> => {
        const { data } = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${edition}/${chapter}.json`);
        return data;
    },
    getVerse: async (edition: string, chapter: number, verse: number): Promise<any> => {
        const { data } = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${edition}/${chapter}/${verse}.json`);
        return data;
    }
};

// Hadith Service
export const HadithService = {
    getEditions: async (): Promise<any> => {
        const { data } = await axios.get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json');
        return data;
    },
    getHadith: async (edition: string, hadithNumber: number): Promise<any> => {
        const { data } = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/${hadithNumber}.json`);
        return data;
    }
};

// Tafsir Service
export const TafsirService = {
    getEditions: async (): Promise<any> => {
        const { data } = await axios.get('https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/editions.json');
        return data;
    },
    getTafsir: async (edition: string, surah: number, ayah: number): Promise<any> => {
        const { data } = await axios.get(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${edition}/${surah}/${ayah}.json`);
        return data;
    }
};

// Dua Service
export const DuaService = {
  getAll: async (): Promise<Dua[]> => {
    const { data } = await api.get<Dua[]>('/duas');
    return data;
  },
  create: async (dua: Partial<Dua>): Promise<Dua> => {
    const { data } = await api.post<Dua>('/duas', dua);
    return data;
  },
  update: async (id: string, dua: Partial<Dua>): Promise<Dua> => {
    const { data } = await api.put<Dua>(`/duas/${id}`, dua);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/duas/${id}`);
  },
  getRandomDua: async (): Promise<any> => {
    const { data } = await axios.get('https://api.du3aa.rest');
    return data;
  }
};

// User Service
export const UserService = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/profile');
    return data;
  },
  updateProfile: async (profile: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>('/users/profile', profile);
    return data;
  },
};

export default api;