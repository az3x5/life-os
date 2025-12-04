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
        .from('health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform to frontend format
      const transformed = data?.map(log => ({
        id: log.id.toString(),
        type: log.metric_type,
        value: log.value,
        date: new Date(log.date),
        note: log.notes
      })) || [];
      
      return res.status(200).json(transformed);
    }

    if (req.method === 'POST') {
      const { type, value, date, notes } = req.body;
      const { data, error } = await supabase
        .from('health_logs')
        .insert({ 
          user_id: userId, 
          metric_type: type,
          value,
          date: date || new Date().toISOString(),
          notes
        })
        .select()
        .single();

      if (error) throw error;
      
      return res.status(201).json({
        id: data.id.toString(),
        type: data.metric_type,
        value: data.value,
        date: new Date(data.date),
        note: data.notes
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

