import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all habits for user with their logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (habitsError) throw habitsError;

    // Get logs for all habits
    const habitIds = habits?.map(h => h.id) || [];
    
    if (habitIds.length > 0) {
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds)
        .order('date', { ascending: false });

      if (logsError) throw logsError;

      // Attach logs to habits
      const habitsWithLogs = habits?.map(habit => ({
        ...habit,
        logs: logs?.filter(log => log.habit_id === habit.id) || []
      }));

      res.json(habitsWithLogs);
    } else {
      res.json([]);
    }
  } catch (error: any) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single habit by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: habit, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Get logs for this habit
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', id)
      .order('date', { ascending: false });

    res.json({ ...habit, logs: logs || [] });
  } catch (error: any) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new habit
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, description, category, frequency, target_days, days_of_week, color, icon, reminder_enabled, reminder_time } = req.body;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        description,
        category: category || 'other',
        frequency: frequency || 'daily',
        target_days,
        days_of_week,
        color,
        icon,
        reminder_enabled: reminder_enabled || false,
        reminder_time,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ ...data, logs: [] });
  } catch (error: any) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update habit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('habits')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST log habit completion
router.post('/:id/log', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { date, completed, notes } = req.body;

    // Check if log already exists for this date
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', id)
      .eq('date', date)
      .single();

    let data;
    if (existing) {
      // Update existing log
      const { data: updated, error } = await supabase
        .from('habit_logs')
        .update({ completed, notes })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      data = updated;
    } else {
      // Create new log
      const { data: created, error } = await supabase
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_id: parseInt(id),
          date,
          completed: completed ?? true,
          notes
        })
        .select()
        .single();
      if (error) throw error;
      data = created;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error logging habit:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE habit
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete associated logs first
    await supabase.from('habit_logs').delete().eq('habit_id', id);

    // Delete the habit
    const { error } = await supabase.from('habits').delete().eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

