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
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { title, amount, type, category, account_id, date, notes } = req.body;
      const { data, error } = await supabase
        .from('transactions')
        .insert({ 
          user_id: userId, 
          title, 
          amount, 
          type: type || 'expense',
          category,
          account_id,
          date: date || new Date().toISOString(),
          notes
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

