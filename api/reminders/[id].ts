import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const userId = req.headers['x-user-id'] as string || process.env.DEMO_USER_ID || 'demo-user';

  try {
    if (req.method === 'PATCH') {
      // Toggle complete
      const { data: existing } = await supabase
        .from('reminders')
        .select('status')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      const newStatus = existing?.status === 'completed' ? 'pending' : 'completed';
      
      const { data, error } = await supabase
        .from('reminders')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      return res.status(200).json({
        id: data.id.toString(),
        title: data.title,
        dueDate: new Date(data.due_date),
        priority: data.priority,
        category: data.category,
        completed: data.status === 'completed'
      });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

