import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

const getUserId = (req: Request): string => {
  return (req.headers['x-user-id'] as string) || process.env.DEMO_USER_ID || 'demo-user-123';
};

// GET finance summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (accountsError) throw accountsError;

    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(100);

    if (txError) throw txError;

    const balance = accounts?.reduce((sum, acc) => {
      return acc.type === 'credit' ? sum - Math.abs(acc.balance) : sum + parseFloat(acc.balance);
    }, 0) || 0;

    const income = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const expenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;

    res.json({ balance, income, expenses, savings: balance });
  } catch (error: any) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all accounts
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create account
router.post('/accounts', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, type, balance, currency } = req.body;

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name,
        type,
        balance: balance || 0,
        currency: currency || 'USD'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update account
router.put('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all transactions
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(name, type)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create transaction
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { account_id, category_id, type, amount, description, date } = req.body;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id,
        category_id,
        type,
        amount,
        description,
        date: date || new Date().toISOString()
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update account balance
    if (account_id) {
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', account_id)
        .single();

      if (account) {
        const newBalance = type === 'income' 
          ? parseFloat(account.balance) + parseFloat(amount)
          : parseFloat(account.balance) - Math.abs(parseFloat(amount));

        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', account_id);
      }
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

