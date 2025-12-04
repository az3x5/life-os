import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

// Get user ID from request (demo or auth)
const getUserId = (req: Request): string => {
  // In production, extract from JWT token
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET all notes for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single note by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Note not found' });
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new note
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, content, folder_id, tags, pinned } = req.body;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title,
        content,
        folder_id,
        tags: tags || [],
        pinned: pinned || false,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('notes')
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
    console.error('Error updating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE note (soft delete by setting status to 'trash')
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('notes')
        .update({ status: 'trash', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

