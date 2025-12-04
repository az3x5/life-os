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

// DELETE account
router.delete('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete associated transactions first
    await supabase.from('transactions').delete().eq('account_id', id);

    // Delete the account
    const { error } = await supabase.from('accounts').delete().eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
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

// GET transaction by ID
router.get('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(name, type)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
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

// PUT update transaction
router.put('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get original transaction to adjust balance
    const { data: originalTx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!originalTx) return res.status(404).json({ error: 'Transaction not found' });

    // Update transaction
    const { data: updatedTx, error: updateError } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Adjust account balances
    const oldAccountId = originalTx.account_id;
    const newAccountId = updatedTx.account_id;
    const oldAmount = parseFloat(originalTx.amount);
    const newAmount = parseFloat(updatedTx.amount);
    const oldType = originalTx.type;
    const newType = updatedTx.type;

    // Revert old transaction from original account
    if (oldAccountId) {
      const { data: oldAccount } = await supabase.from('accounts').select('balance').eq('id', oldAccountId).single();
      if (oldAccount) {
        const balanceAdjustment = oldType === 'income' ? -oldAmount : +oldAmount;
        await supabase
          .from('accounts')
          .update({ balance: parseFloat(oldAccount.balance) + balanceAdjustment })
          .eq('id', oldAccountId);
      }
    }
    
    // Apply new transaction to new/current account
    if (newAccountId) {
        const { data: newAccount } = await supabase.from('accounts').select('balance').eq('id', newAccountId).single();
        if (newAccount) {
            const balanceAdjustment = newType === 'income' ? +newAmount : -newAmount;
            await supabase
                .from('accounts')
                .update({ balance: parseFloat(newAccount.balance) + balanceAdjustment })
                .eq('id', newAccountId);
        }
    }

    res.json(updatedTx);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE transaction
router.delete('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get transaction details to adjust balance
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    
    // Delete the transaction
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);
    if (deleteError) throw deleteError;

    // Revert balance on the associated account
    if (transaction.account_id) {
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();
      
      if (account) {
        const amount = parseFloat(transaction.amount);
        const balanceUpdate = transaction.type === 'income' ? -amount : +amount;

        await supabase
          .from('accounts')
          .update({ balance: parseFloat(account.balance) + balanceUpdate })
          .eq('id', transaction.account_id);
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

