import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { FinanceSummary } from '../../types';

interface FinanceCardProps {
  data: FinanceSummary;
}

const FinanceCard: React.FC<FinanceCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Finance</h3>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-sm text-slate-500">Total Balance</span>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <ArrowUpRight size={14} />
            <span className="text-xs font-medium">Income</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">${data.income.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="flex items-center gap-1 text-rose-600 mb-1">
            <ArrowDownRight size={14} />
            <span className="text-xs font-medium">Expenses</span>
          </div>
           <p className="text-sm font-semibold text-slate-900">${data.expenses.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;
