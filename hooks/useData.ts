import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotesService,
  RemindersService,
  HabitsService,
  FinanceService,
  HealthService,
  FinanceSummary,
  HabitWithLogs
} from '../services/api';
import { Note, Reminder, Transaction, HealthLog, Account } from '../types';

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

  const toggleComplete = async (id: string) => {
    const updated = await RemindersService.toggleComplete(id);
    setData(prev => prev?.map(r => r.id === id ? updated : r) || null);
    return updated;
  };

  const deleteReminder = async (id: string) => {
    await RemindersService.delete(id);
    setData(prev => prev?.filter(r => r.id !== id) || null);
  };

  return { reminders: reminders || [], loading, error, refetch, createReminder, toggleComplete, deleteReminder };
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

  const logCompletion = async (id: string, date: string, completed: boolean) => {
    await HabitsService.logCompletion(id, date, completed);
    refetch(); // Refetch to get updated logs
  };

  const deleteHabit = async (id: string) => {
    await HabitsService.delete(id);
    setData(prev => prev?.filter(h => h.id.toString() !== id) || null);
  };

  return { habits: habits || [], loading, error, refetch, createHabit, logCompletion, deleteHabit };
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

  return { summary, accounts, transactions, loading, error, refetch: fetchAll, createTransaction };
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

  return { logs: logs || [], loading, error, refetch, logEntry };
}

