import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all calendar events
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new calendar event
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, date, start_time, end_time, category, location } = req.body;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title,
        date,
        start_time,
        end_time,
        category,
        location,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update calendar event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE calendar event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
