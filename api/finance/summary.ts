import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.headers['x-user-id'] as string || process.env.DEMO_USER_ID || 'demo-user';

  try {
    if (req.method === 'GET') {
      // Get accounts balance
      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance, type')
        .eq('user_id', userId);

      // Get this month's transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString());

      // Calculate totals
      const balance = accounts?.reduce((sum, acc) => 
        acc.type === 'credit' ? sum - Math.abs(acc.balance) : sum + acc.balance, 0) || 0;
      
      const income = transactions?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      
      const expenses = transactions?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      return res.status(200).json({ balance, income, expenses });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

