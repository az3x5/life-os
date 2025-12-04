import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, username, bio } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, username, bio })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
