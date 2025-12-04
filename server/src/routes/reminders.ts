import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all reminders for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single reminder by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reminder not found' });
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new reminder
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, description, due_date, due_time, priority, category, recurring, tags } = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        title,
        description,
        due_date,
        due_time,
        priority: priority || 'medium',
        category: category || 'general',
        status: 'pending',
        recurring,
        tags: tags || []
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update reminder
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH toggle reminder completion
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First get the current state
    const { data: current, error: fetchError } = await supabase
      .from('reminders')
      .select('status, completed_at')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!current) return res.status(404).json({ error: 'Reminder not found' });

    const newStatus = current.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('reminders')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error toggling reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE reminder
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

