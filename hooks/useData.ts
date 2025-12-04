import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotesService,
  RemindersService,
  HabitsService,
  FinanceService,
  HealthService,
  CalendarService,
  DuaService,
  UserService,
  QuranService,
  HadithService,
  TafsirService,
  FinanceSummary,
  HabitWithLogs
} from '../services/api';
import { Note, Reminder, Transaction, HealthLog, Account, CalendarEvent, Dua, User } from '../types';

// Generic hook for data fetching with loading and error states
function useApiData<T>(
  fetchFn: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const hasFetched = useRef(false);

  // Update ref when fetchFn changes
  fetchFnRef.current = fetchFn;

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      refetch();
    }
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}

// Notes Hook
export function useNotes() {
  const { data: notes, loading, error, refetch, setData } = useApiData<Note[]>(
    () => NotesService.getAll()
  );

  const createNote = async (note: Partial<Note>) => {
    const newNote = await NotesService.create(note);
    setData(prev => prev ? [newNote, ...prev] : [newNote]);
    return newNote;
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    const updated = await NotesService.update(id, note);
    setData(prev => prev?.map(n => n.id === id ? updated : n) || null);
    return updated;
  };

  const deleteNote = async (id: string) => {
    await NotesService.delete(id);
    setData(prev => prev?.filter(n => n.id !== id) || null);
  };

  return { notes: notes || [], loading, error, refetch, createNote, updateNote, deleteNote };
}

// Reminders Hook
export function useReminders() {
  const { data: reminders, loading, error, refetch, setData } = useApiData<Reminder[]>(
    () => RemindersService.getAll()
  );

  const createReminder = async (reminder: Partial<Reminder>) => {
    const newReminder = await RemindersService.create(reminder);
    setData(prev => prev ? [...prev, newReminder] : [newReminder]);
    return newReminder;
  };

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    const updatedReminder = await RemindersService.update(id, reminder);
    setData(prev => prev?.map(r => r.id === id ? updatedReminder : r) || null);
    return updatedReminder;
  };

  const toggleComplete = async (id: string) => {
    const updated = await RemindersService.toggleComplete(id);
    setData(prev => prev?.map(r => r.id === id ? updated : r) || null);
    return updated;
  };

  const deleteReminder = async (id: string) => {
    await RemindersService.delete(id);
    setData(prev => prev?.filter(r => r.id !== id) || null);
  };

  return { reminders: reminders || [], loading, error, refetch, createReminder, updateReminder, toggleComplete, deleteReminder };
}

// Habits Hook
export function useHabits() {
  const { data: habits, loading, error, refetch, setData } = useApiData<HabitWithLogs[]>(
    () => HabitsService.getAll()
  );

  const createHabit = async (habit: Partial<HabitWithLogs>) => {
    const newHabit = await HabitsService.create(habit);
    setData(prev => prev ? [newHabit, ...prev] : [newHabit]);
    return newHabit;
  };

  const updateHabit = async (id: string, habit: Partial<HabitWithLogs>) => {
    const updatedHabit = await HabitsService.update(id, habit);
    setData(prev => prev?.map(h => h.id.toString() === id ? { ...h, ...updatedHabit } : h) || null);
    return updatedHabit;
  };

  const logCompletion = async (id: string, date: string, completed: boolean) => {
    await HabitsService.logCompletion(id, date, completed);
    refetch(); // Refetch to get updated logs
  };

  const deleteHabit = async (id: string) => {
    await HabitsService.delete(id);
    setData(prev => prev?.filter(h => h.id.toString() !== id) || null);
  };

  return { habits: habits || [], loading, error, refetch, createHabit, updateHabit, logCompletion, deleteHabit };
}

// Finance Hook
export function useFinance() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, accountsData, txData] = await Promise.all([
        FinanceService.getSummary(),
        FinanceService.getAccounts(),
        FinanceService.getTransactions()
      ]);
      setSummary(summaryData);
      setAccounts(accountsData);
      setTransactions(txData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createTransaction = async (tx: Partial<Transaction>) => {
    const newTx = await FinanceService.createTransaction(tx);
    setTransactions(prev => [newTx, ...prev]);
    fetchAll(); // Refetch to update summary
    return newTx;
  };

  const updateTransaction = async (id: string, tx: Partial<Transaction>) => {
    const updatedTx = await FinanceService.updateTransaction(id, tx);
    setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
    fetchAll(); // Refetch to update summary
    return updatedTx;
  };

  const deleteTransaction = async (id: string) => {
    await FinanceService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    fetchAll(); // Refetch to update summary
  };

  const createAccount = async (account: Partial<Account>) => {
    const newAccount = await FinanceService.createAccount(account);
    setAccounts(prev => [newAccount, ...prev]);
    fetchAll(); // Refetch to update summary
    return newAccount;
  };

  const updateAccount = async (id: string, account: Partial<Account>) => {
    const updatedAccount = await FinanceService.updateAccount(id, account);
    setAccounts(prev => prev.map(a => a.id === id ? updatedAccount : a));
    fetchAll(); // Refetch to update summary
    return updatedAccount;
  };

  const deleteAccount = async (id: string) => {
    await FinanceService.deleteAccount(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    fetchAll(); // Refetch to update summary
  };

  return { summary, accounts, transactions, loading, error, refetch: fetchAll, createTransaction, updateTransaction, deleteTransaction, createAccount, updateAccount, deleteAccount };
}

// Health Hook
export function useHealth() {
  const { data: logs, loading, error, refetch, setData } = useApiData<HealthLog[]>(
    () => HealthService.getLogs()
  );

  const logEntry = async (entry: { metric_id: number; value: number; date?: string; notes?: string }) => {
    const newLog = await HealthService.logEntry(entry);
    refetch();
    return newLog;
  };

  const updateLog = async (id: string, entry: Partial<HealthLog>) => {
    const updatedLog = await HealthService.updateLog(id, entry);
    setData(prev => prev?.map(l => l.id === id ? updatedLog : l) || null);
    return updatedLog;
  };

  const deleteLog = async (id: string) => {
    await HealthService.deleteLog(id);
    setData(prev => prev?.filter(l => l.id !== id) || null);
  };

  return { logs: logs || [], loading, error, refetch, logEntry, updateLog, deleteLog };
}

// Calendar Hook
export function useCalendar() {
  const { data: events, loading, error, refetch, setData } = useApiData<CalendarEvent[]>(
    () => CalendarService.getAll()
  );

  const createEvent = async (event: Partial<CalendarEvent>) => {
    const newEvent = await CalendarService.create(event);
    setData(prev => prev ? [...prev, newEvent] : [newEvent]);
    return newEvent;
  };

  const updateEvent = async (id: string, event: Partial<CalendarEvent>) => {
    const updatedEvent = await CalendarService.update(id, event);
    setData(prev => prev?.map(e => e.id === id ? updatedEvent : e) || null);
    return updatedEvent;
  };

  const deleteEvent = async (id: string) => {
    await CalendarService.delete(id);
    setData(prev => prev?.filter(e => e.id !== id) || null);
  };

  return { events: events || [], loading, error, refetch, createEvent, updateEvent, deleteEvent };
}

// Dua Hook
export function useDuas() {
  const { data: duas, loading, error, refetch, setData } = useApiData<Dua[]>(
    () => DuaService.getAll()
  );

  const createDua = async (dua: Partial<Dua>) => {
    const newDua = await DuaService.create(dua);
    setData(prev => prev ? [...prev, newDua] : [newDua]);
    return newDua;
  };

  const updateDua = async (id: string, dua: Partial<Dua>) => {
    const updatedDua = await DuaService.update(id, dua);
    setData(prev => prev?.map(d => d.id === id ? updatedDua : d) || null);
    return updatedDua;
  };

  const deleteDua = async (id: string) => {
    await DuaService.delete(id);
    setData(prev => prev?.filter(d => d.id !== id) || null);
  };

  const getRandomDua = async () => {
    const randomDua = await DuaService.getRandomDua();
    return randomDua;
  }

  return { duas: duas || [], loading, error, refetch, createDua, updateDua, deleteDua, getRandomDua };
}

// User Hook
export function useUser() {
  const { data: profile, loading, error, refetch, setData } = useApiData<User>(
    () => UserService.getProfile()
  );

  const updateProfile = async (profile: Partial<User>) => {
    const updatedProfile = await UserService.updateProfile(profile);
    setData(updatedProfile);
    return updatedProfile;
  };

  return { profile, loading, error, refetch, updateProfile };
}

// Quran Hook
export function useQuran() {
    const [editions, setEditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getEditions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await QuranService.getEditions();
            setEditions(Object.values(data));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getChapter = async (edition: string, chapter: number) => {
        setLoading(true);
        try {
            const data = await QuranService.getChapter(edition, chapter);
            return data.quran;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { editions, loading, error, getEditions, getChapter };
}

// Hadith Hook
export function useHadith() {
    const [editions, setEditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getEditions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await HadithService.getEditions();
            setEditions(Object.values(data));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getHadith = async (edition: string, hadithNumber: number) => {
        setLoading(true);
        try {
            const data = await HadithService.getHadith(edition, hadithNumber);
            return data.hadiths;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { editions, loading, error, getEditions, getHadith };
}

// Tafsir Hook
export function useTafsir() {
    const [editions, setEditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getEditions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await TafsirService.getEditions();
            setEditions(Object.values(data));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getTafsir = async (edition: string, surah: number, ayah: number) => {
        setLoading(true);
        try {
            const data = await TafsirService.getTafsir(edition, surah, ayah);
            return data.text;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { editions, loading, error, getEditions, getTafsir };
}