import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all health logs for user
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('health_logs')
      .select('*, health_metrics(name, unit, icon)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching health logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET health metrics definitions
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET health goals
router.get('/goals', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching health goals:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create health log entry
router.post('/logs', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { metric_id, value, date, notes } = req.body;

    const { data, error } = await supabase
      .from('health_logs')
      .insert({
        user_id: userId,
        metric_id,
        value,
        date: date || new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating health log:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update health log
router.put('/logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('health_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating health log:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE health log
router.delete('/logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('health_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting health log:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create health goal
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { metric_id, target_value, target_date, name } = req.body;

    const { data, error } = await supabase
      .from('health_goals')
      .insert({
        user_id: userId,
        metric_id,
        target_value,
        target_date,
        name
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating health goal:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update health goal
router.put('/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('health_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating health goal:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE health goal
router.delete('/goals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('health_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting health goal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

