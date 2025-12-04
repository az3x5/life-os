import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PieChart,
  Plus,
  Search,
  Filter,
  ShoppingBag,
  Coffee,
  Zap,
  Briefcase,
  PanelLeft,
  MoreVertical,
  Wallet,
  TrendingUp,
  Landmark,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit2,
  X,
  Calendar,
  Layers,
  Tag,
  Repeat,
  LayoutDashboard,
  Target,
  FileText,
  BarChart2,
  Shield,
  Laptop,
  Plane,
  Home,
  Check,
  Scale,
  Percent,
  Hash,
  Loader2
} from 'lucide-react';
import {
  MOCK_BUDGETS,
  MOCK_SAVINGS_GOALS,
  MOCK_BILLS,
  MOCK_INVESTMENTS,
  MOCK_LOANS
} from '../../constants';
import { Transaction, Account, SavingsGoal, Bill, Investment, Budget, Loan } from '../../types';
import { format, addDays, isPast, isFuture } from 'date-fns';
import { useFinance } from '../../hooks/useData';

type FinanceView = 'overview' | 'transactions' | 'budgets' | 'goals' | 'bills' | 'investments' | 'loans';

const FinanceModule: React.FC = () => {
  // API Hook
  const { summary, accounts: apiAccounts, transactions: apiTransactions, loading, createTransaction: apiCreateTransaction } = useFinance();

  const [activeView, setActiveView] = useState<FinanceView>('overview');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'transaction' | 'bill' | 'investment' | 'budget' | 'loan'>('transaction');

  // Data State - synced with API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [goals] = useState<SavingsGoal[]>(MOCK_SAVINGS_GOALS);
  const [bills] = useState<Bill[]>(MOCK_BILLS);
  const [investments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [loans] = useState<Loan[]>(MOCK_LOANS);

  // Sync API data to local state
  useEffect(() => {
    if (apiTransactions.length > 0 || !loading) {
      setTransactions(apiTransactions);
    }
  }, [apiTransactions, loading]);

  useEffect(() => {
    if (apiAccounts.length > 0 || !loading) {
      setAccounts(apiAccounts);
    }
  }, [apiAccounts, loading]);

  // Filters State
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txAccountFilter, setTxAccountFilter] = useState('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income'|'expense'>('expense');
  const [newCategory, setNewCategory] = useState('food');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Type-specific Form State
  const [newInterestRate, setNewInterestRate] = useState(''); // Loan
  const [newProvider, setNewProvider] = useState(''); // Loan
  const [newSymbol, setNewSymbol] = useState(''); // Investment
  const [newQuantity, setNewQuantity] = useState(''); // Investment
  const [newFrequency, setNewFrequency] = useState('monthly'); // Bill

  // --- Derived Metrics (use API summary if available) ---
  const totalBalance = summary?.balance ?? accounts.reduce((sum, acc) => acc.type === 'credit' ? sum - Math.abs(acc.balance) : sum + acc.balance, 0);
  const monthlyIncome = summary?.income ?? transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = summary?.expenses ?? transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // --- Navigation Items ---
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Layers },
    { id: 'budgets', label: 'Budgets & Analytics', icon: BarChart2 },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'bills', label: 'Bills & Recurring', icon: Calendar },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'loans', label: 'Loans & Debt', icon: Scale },
  ];

  // --- Helpers ---
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return Coffee;
      case 'shopping': return ShoppingBag;
      case 'bills': return Zap;
      case 'salary': return Briefcase;
      case 'transport': return CreditCard;
      case 'investment': return TrendingUp;
      case 'entertainment': return Laptop;
      case 'insurance': return Shield;
      default: return DollarSign;
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return CreditCard;
      case 'savings': return Landmark;
      case 'investment': return PieChart;
      case 'credit': return CreditCard;
      case 'cash': return Wallet;
      default: return Wallet;
    }
  };

  const getGoalIcon = (iconName?: string) => {
     switch(iconName) {
        case 'Shield': return Shield;
        case 'Laptop': return Laptop;
        case 'Plane': return Plane;
        case 'Home': return Home;
        default: return Target;
     }
  }

  // --- Handlers ---
  const openAddModal = (type: 'transaction' | 'bill' | 'investment' | 'budget' | 'loan') => {
     setAddModalType(type);
     setNewTitle('');
     setNewAmount('');
     setNewDate(new Date().toISOString().split('T')[0]);
     setNewInterestRate('');
     setNewProvider('');
     setNewSymbol('');
     setNewQuantity('');
     setIsAddModalOpen(true);
  }

  const handleAddItem = () => {
    if (!newTitle || !newAmount) return;
    
    if (addModalType === 'transaction') {
      const newTx: Transaction = {
        id: Date.now().toString(),
        title: newTitle,
        amount: newType === 'expense' ? -Math.abs(Number(newAmount)) : Math.abs(Number(newAmount)),
        type: newType,
        category: newCategory as any,
        date: new Date(newDate),
        account: 'checking',
        notes: newNotes,
      };
      setTransactions([newTx, ...transactions]);
    }
    
    // Reset & Close
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
     setTransactions(prev => prev.filter(t => t.id !== id));
  }

  // --- Views ---
  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Net Worth & Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
           <div>
              <p className="text-slate-400 font-medium text-sm mb-1">Total Net Worth</p>
              <h2 className="text-3xl font-bold tracking-tight">${totalBalance.toLocaleString()}</h2>
           </div>
           <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <TrendingUp size={16} />
              <span>+2.4% this month</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                 <ArrowUpRight size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Monthly Income</span>
           </div>
           <div>
              <h2 className="text-2xl font-bold text-slate-900">${monthlyIncome.toLocaleString()}</h2>
              <p className="text-xs text-slate-400 mt-1">From all sources</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                 <ArrowDownRight size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Monthly Expenses</span>
           </div>
           <div>
              <h2 className="text-2xl font-bold text-slate-900">${monthlyExpenses.toLocaleString()}</h2>
              <p className="text-xs text-slate-400 mt-1">Limit: $2,500</p>
           </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
         <h3 className="text-lg font-bold text-slate-900 mb-4">Accounts</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map(acc => {
               const Icon = getAccountIcon(acc.type);
               return (
                  <div key={acc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-lg ${acc.type === 'savings' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                           <Icon size={20} />
                        </div>
                        {acc.type === 'credit' && <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Credit</span>}
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 truncate">{acc.name}</p>
                        <p className={`text-xl font-bold ${acc.type === 'credit' ? 'text-slate-900' : 'text-slate-900'}`}>
                           {acc.type === 'credit' ? '-' : ''}${Math.abs(acc.balance).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{acc.accountNumber}</p>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
    </div>
  );

  const renderTransactions = () => {
    const filtered = transactions.filter(t => 
      t.title.toLowerCase().includes(txSearchQuery.toLowerCase()) &&
      (txAccountFilter === 'all' || t.account === txAccountFilter) &&
      (txCategoryFilter === 'all' || t.type === txCategoryFilter)
    );

    return (
       <div className="animate-fade-in max-w-6xl mx-auto h-full flex flex-col">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                   type="text" 
                   placeholder="Search transactions..." 
                   value={txSearchQuery}
                   onChange={(e) => setTxSearchQuery(e.target.value)}
                   className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none placeholder-slate-400 text-slate-900"
                />
             </div>
             <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                <select 
                   value={txCategoryFilter}
                   onChange={(e) => setTxCategoryFilter(e.target.value)}
                   className="px-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm bg-white focus:outline-none focus:border-slate-400"
                >
                   <option value="all">All Categories</option>
                   <option value="income">Income</option>
                   <option value="expense">Expense</option>
                </select>
                <select 
                   value={txAccountFilter}
                   onChange={(e) => setTxAccountFilter(e.target.value)}
                   className="px-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm bg-white focus:outline-none focus:border-slate-400"
                >
                   <option value="all">All Accounts</option>
                   <option value="checking">Checking</option>
                   <option value="savings">Savings</option>
                   <option value="credit">Credit</option>
                </select>
             </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
             <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-[calc(100vh-16rem)] p-2">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="p-4 rounded-l-xl">Transaction</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Account</th>
                          <th className="p-4 text-right rounded-r-xl">Amount</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(tx => {
                          const Icon = getCategoryIcon(tx.category);
                          return (
                              <tr key={tx.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                          <Icon size={16} />
                                      </div>
                                      <span className="font-semibold text-slate-900 text-sm">{tx.title}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-500 capitalize">
                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{tx.category}</span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                                <td className="p-4 text-sm text-slate-500 capitalize">{tx.account}</td>
                                <td className={`p-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {tx.type === 'income' ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDeleteTransaction(tx.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                      <Trash2 size={16} />
                                    </button>
                                </td>
                              </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
       </div>
    );
  };

  const renderBudgets = () => (
     <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Budgets & Analytics</h2>
            <button 
               onClick={() => openAddModal('budget')} 
               className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
               <Plus size={16} /> Edit Budgets
            </button>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-center">
           <BarChart2 size={48} className="text-slate-200 mb-4" />
           <h3 className="text-lg font-bold text-slate-900">Spending Analysis</h3>
           <p className="text-slate-500 max-w-md">Spending trends and analysis would appear here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Monthly Budgets</h3>
              <div className="space-y-6">
                 {budgets.map(budget => {
                    const percent = Math.min(100, (budget.spent / budget.limit) * 100);
                    return (
                       <div key={budget.id}>
                          <div className="flex justify-between text-sm mb-2">
                             <span className="font-medium text-slate-700">{budget.category}</span>
                             <span className="text-slate-500">${budget.spent} / ${budget.limit}</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${percent > 100 ? 'bg-red-500' : 'bg-slate-900'}`} 
                                style={{ width: `${percent}%` }}
                             />
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>
     </div>
  );

  const renderGoals = () => (
     <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-slate-900">Savings Goals</h2>
           <button 
             onClick={() => openAddModal('budget')} 
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
           >
              <Plus size={16} /> New Goal
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {goals.map(goal => {
              const percent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              const Icon = getGoalIcon(goal.icon);
              return (
                 <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                       <div className={`p-3 rounded-xl bg-${goal.color}-50 text-${goal.color}-600`}>
                          <Icon size={24} />
                       </div>
                       <span className="text-2xl font-bold text-slate-900">{percent}%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{goal.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">Target: ${goal.targetAmount.toLocaleString()}</p>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                       <div 
                          className={`h-full bg-${goal.color}-500 rounded-full`}
                          style={{ width: `${percent}%` }} 
                       />
                    </div>
                 </div>
              )
           })}
        </div>
     </div>
  );

  const renderBills = () => (
     <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recurring Bills</h2>
          <button 
             onClick={() => openAddModal('bill')} 
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
             <Plus size={16} /> Add Bill
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="divide-y divide-slate-50">
              {bills.map(bill => (
                 <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                          <span className="text-[10px] uppercase text-slate-400">{format(new Date(bill.dueDate), 'MMM')}</span>
                          <span className="text-lg text-slate-900">{format(new Date(bill.dueDate), 'd')}</span>
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900">{bill.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                             <span className="capitalize">{bill.frequency}</span>
                             {bill.autoPay && <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium">Auto-pay</span>}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg text-slate-900">${bill.amount}</p>
                       <button className={`text-xs font-bold mt-1 px-3 py-1 rounded-full border transition-colors ${bill.isPaid ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                          {bill.isPaid ? 'Paid' : 'Mark Paid'}
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  );

  const renderLoans = () => (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Loans & Debt</h2>
        <button 
          onClick={() => openAddModal('loan')} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> Add Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map(loan => {
          const progress = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
          return (
            <div key={loan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <Scale size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">${loan.remainingAmount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium">Remaining Principal</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{loan.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{loan.provider} • {loan.interestRate}% APR</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">
                    <span>Progress</span>
                    <span>{Math.round(progress)}% Paid</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Monthly</div>
                    <div className="font-bold text-slate-900">${loan.monthlyPayment}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase">Due Day</div>
                    <div className="font-bold text-slate-900">{loan.dueDate}th</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const renderInvestments = () => (
     <div className="animate-fade-in max-w-6xl mx-auto">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900">Portfolio Holdings</h2>
           <button 
             onClick={() => openAddModal('investment')} 
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
           >
             <Plus size={16} /> Add Investment
           </button>
         </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                       <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                          <tr>
                             <th className="p-4 pl-6">Asset</th>
                             <th className="p-4">Price</th>
                             <th className="p-4">Balance</th>
                             <th className="p-4 pr-6 text-right">Change</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {investments.map(inv => (
                             <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 pl-6">
                                   <div className="font-bold text-slate-900">{inv.symbol}</div>
                                   <div className="text-xs text-slate-500">{inv.name}</div>
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-700">${inv.currentPrice.toLocaleString()}</td>
                                <td className="p-4">
                                   <div className="font-bold text-slate-900">${inv.value.toLocaleString()}</div>
                                   <div className="text-xs text-slate-500">{inv.quantity} shares</div>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                   <span className={`font-bold text-sm ${inv.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {inv.change > 0 ? '+' : ''}{inv.change}%
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Allocation</h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-64 flex items-center justify-center">
                 <div className="text-center">
                    <PieChart size={48} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Portfolio Visualization</p>
                 </div>
              </div>
           </div>
        </div>
     </div>
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

      {/* Navigation Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
             <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Wallet size={22} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900">Finance</h2>
                <p className="text-xs text-slate-500 font-medium">Wealth Management</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navItems.map((item) => {
               const Icon = item.icon;
               return (
                  <button
                     key={item.id}
                     onClick={() => { setActiveView(item.id as FinanceView); setMobileMenuOpen(false); }}
                     className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeView === item.id ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                     <Icon size={18} className={activeView === item.id ? 'text-emerald-600' : 'text-slate-400'} />
                     {item.label}
                  </button>
               )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
         
         {/* Top Header */}
         <div className="h-16 px-6 md:px-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
               >
                 <MoreVertical size={20} />
               </button>
               <button 
                 onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                 className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
               >
                 <PanelLeft size={20} />
               </button>
               <h2 className="text-xl font-bold text-slate-900 capitalize">
                  {navItems.find(n => n.id === activeView)?.label}
               </h2>
            </div>
            
            <button 
               onClick={() => openAddModal('transaction')}
               className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200"
            >
               <Plus size={18} />
               <span className="hidden sm:inline">Add Transaction</span>
            </button>
         </div>

         {/* Scrollable View Area */}
         <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-8">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'transactions' && renderTransactions()}
            {activeView === 'budgets' && renderBudgets()}
            {activeView === 'goals' && renderGoals()}
            {activeView === 'bills' && renderBills()}
            {activeView === 'investments' && renderInvestments()}
            {activeView === 'loans' && renderLoans()}
         </div>
      </div>

      {/* Generic Add Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
               <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X size={24} />
               </button>
               
               <h3 className="text-xl font-bold text-slate-900 mb-6 capitalize">Add {addModalType}</h3>

               <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {addModalType === 'transaction' && (
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl">
                       <button 
                          onClick={() => setNewType('expense')}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${newType === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          Expense
                       </button>
                       <button 
                          onClick={() => setNewType('income')}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${newType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          Income
                       </button>
                    </div>
                  )}

                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                       {addModalType === 'budget' ? 'Limit Amount' : addModalType === 'loan' ? 'Total Amount' : 'Amount'}
                     </label>
                     <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                           type="number" 
                           autoFocus
                           value={newAmount}
                           onChange={(e) => setNewAmount(e.target.value)}
                           className="w-full text-3xl font-bold border border-slate-200 rounded-xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400 text-slate-900" 
                           placeholder="0.00" 
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {addModalType === 'budget' ? 'Category Name' : addModalType === 'loan' ? 'Loan Name' : addModalType === 'bill' ? 'Biller Name' : 'Description'}
                     </label>
                     <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400 text-slate-900" 
                        placeholder={addModalType === 'budget' ? "e.g. Groceries" : "e.g. Grocery Run"} 
                     />
                  </div>

                  {/* Dynamic Fields based on Type */}
                  <div className="grid grid-cols-2 gap-4">
                     {addModalType === 'transaction' && (
                       <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                          <select 
                             value={newCategory} 
                             onChange={(e) => setNewCategory(e.target.value)}
                             className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none capitalize transition-shadow text-slate-900"
                          >
                             {['food', 'transport', 'shopping', 'bills', 'salary', 'investment'].map(c => (
                                <option key={c} value={c}>{c}</option>
                             ))}
                          </select>
                       </div>
                     )}
                     
                     {addModalType === 'bill' && (
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                           <select 
                              value={newFrequency}
                              onChange={(e) => setNewFrequency(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none capitalize transition-shadow text-slate-900"
                           >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                           </select>
                        </div>
                     )}

                     {addModalType === 'loan' && (
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interest Rate %</label>
                           <div className="relative">
                              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                              <input 
                                 type="number" 
                                 value={newInterestRate}
                                 onChange={(e) => setNewInterestRate(e.target.value)}
                                 className="w-full pl-9 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400 text-slate-900" 
                                 placeholder="4.5"
                              />
                           </div>
                        </div>
                     )}

                     {addModalType === 'investment' && (
                        <>
                           <div className="col-span-1">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Symbol</label>
                              <input 
                                 type="text" 
                                 value={newSymbol}
                                 onChange={(e) => setNewSymbol(e.target.value)}
                                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none uppercase transition-shadow placeholder-slate-400 text-slate-900" 
                                 placeholder="AAPL"
                              />
                           </div>
                           <div className="col-span-1">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                              <input 
                                 type="number" 
                                 value={newQuantity}
                                 onChange={(e) => setNewQuantity(e.target.value)}
                                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400 text-slate-900" 
                                 placeholder="10"
                              />
                           </div>
                        </>
                     )}
                     
                     <div className={addModalType === 'investment' ? 'col-span-2' : ''}>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                           {addModalType === 'bill' ? 'Due Date' : 'Date'}
                         </label>
                         <input 
                           type="date" 
                           className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-shadow text-slate-900" 
                           value={newDate}
                           onChange={(e) => setNewDate(e.target.value)}
                         />
                     </div>
                  </div>

                  {addModalType === 'transaction' && (
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes (Optional)</label>
                       <textarea 
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none transition-shadow placeholder-slate-400 text-slate-900"
                          rows={2}
                          placeholder="Additional details..."
                       />
                    </div>
                  )}

                  {addModalType === 'loan' && (
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Provider / Lender</label>
                        <input 
                           type="text" 
                           value={newProvider}
                           onChange={(e) => setNewProvider(e.target.value)}
                           className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400 text-slate-900" 
                           placeholder="e.g. Chase Bank" 
                        />
                     </div>
                  )}
               </div>

               <div className="pt-6 mt-2 border-t border-slate-100">
                  <button 
                     onClick={handleAddItem}
                     disabled={!newTitle || !newAmount}
                     className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                  >
                     Save {addModalType}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default FinanceModule;