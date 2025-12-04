import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const userId = req.headers['x-user-id'] as string || process.env.DEMO_USER_ID || 'demo-user';

  try {
    if (req.method === 'POST') {
      const { date, completed, notes } = req.body;
      
      // Upsert the log (update if exists, insert if not)
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert({ 
          habit_id: parseInt(id as string),
          user_id: userId,
          date: date || new Date().toISOString().split('T')[0],
          completed: completed ?? true,
          notes
        }, {
          onConflict: 'habit_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

