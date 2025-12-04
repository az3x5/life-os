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
      // Get habits with their logs
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      // Get logs for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (logsError) throw logsError;

      // Combine habits with their logs
      const habitsWithLogs = habits.map(habit => ({
        ...habit,
        logs: logs.filter(log => log.habit_id === habit.id)
      }));

      return res.status(200).json(habitsWithLogs);
    }

    if (req.method === 'POST') {
      const { name, description, category, frequency, color, icon } = req.body;
      const { data, error } = await supabase
        .from('habits')
        .insert({ 
          user_id: userId, 
          name, 
          description, 
          category: category || 'personal',
          frequency: frequency || 'daily',
          color: color || 'blue',
          icon
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ ...data, logs: [] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

