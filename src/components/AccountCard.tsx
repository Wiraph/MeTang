import React from 'react';
import { Account } from '@/types';
import { Building2, Smartphone, DollarSign, TrendingUp } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  isSelected?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onClick, isSelected }) => {
  const balanceNum = parseFloat(account.currentBalance || '0');
  const formattedBalance = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(balanceNum);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT':
        return <TrendingUp className="w-3.5 h-3.5 text-slate-500" />;
      case 'E_WALLET':
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
      case 'CASH':
        return <DollarSign className="w-3.5 h-3.5 text-slate-500" />;
      case 'BANK':
      default:
        return <Building2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full p-3.5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900 text-white border-slate-900 shadow-md translate-y-[-1px]'
          : 'bg-white border-slate-200/80 text-slate-900 shadow-xs hover:shadow-md hover:border-slate-300 active:scale-[0.98]'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: account.color || '#64748B' }}
          />
          <span className={`font-semibold text-xs truncate ${isSelected ? 'text-slate-100' : 'text-slate-700'}`}>
            {account.name}
          </span>
        </div>
        <span className={`p-1 rounded-lg flex-shrink-0 ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {getAccountIcon(account.type)}
        </span>
      </div>

      <div>
        <span className={`text-[10px] font-medium tracking-wide block uppercase ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
          Balance
        </span>
        <span className={`text-sm font-bold tracking-tight block truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
          {formattedBalance}
        </span>
      </div>
    </div>
  );
};
