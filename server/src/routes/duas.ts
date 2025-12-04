import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all duas
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('duas')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) => {
    console.error('Error fetching duas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new dua
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, arabic, translation, reference, category, is_favorite } = req.body;

    const { data, error } = await supabase
      .from('duas')
      .insert({
        user_id: userId,
        title,
        arabic,
        translation,
        reference,
        category,
        is_favorite: is_favorite || false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating dua:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update dua
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('duas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) => {
    console.error('Error updating dua:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE dua
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('duas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting dua:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
