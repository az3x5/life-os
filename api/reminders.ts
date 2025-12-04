import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.headers['x-user-id'] as string || process.env.DEMO_USER_ID || 'demo-user';

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Transform to frontend format
      const transformed = data.map(r => ({
        id: r.id.toString(),
        title: r.title,
        dueDate: new Date(r.due_date),
        priority: r.priority || 'medium',
        category: r.category || 'personal',
        completed: r.status === 'completed'
      }));
      
      return res.status(200).json(transformed);
    }

    if (req.method === 'POST') {
      const { title, dueDate, priority, category } = req.body;
      const { data, error } = await supabase
        .from('reminders')
        .insert({ 
          user_id: userId, 
          title, 
          due_date: dueDate, 
          priority: priority || 'medium',
          category: category || 'personal',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      return res.status(201).json({
        id: data.id.toString(),
        title: data.title,
        dueDate: new Date(data.due_date),
        priority: data.priority,
        category: data.category,
        completed: false
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

