import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all savings goals
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create savings goal
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, target_amount, current_amount, deadline } = req.body;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name,
        target_amount,
        current_amount: current_amount || 0,
        deadline
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update savings goal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('savings_goals')
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
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH add to savings goal
router.patch('/:id/add', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Get current amount
    const { data: current, error: fetchError } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = parseFloat(current.current_amount) + parseFloat(amount);

    const { data, error } = await supabase
      .from('savings_goals')
      .update({ 
        current_amount: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error adding to savings goal:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE savings goal
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

