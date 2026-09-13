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
        return <TrendingUp className="w-3.5 h-3.5 text-stone-600" />;
      case 'E_WALLET':
        return <Smartphone className="w-3.5 h-3.5 text-stone-600" />;
      case 'CASH':
        return <DollarSign className="w-3.5 h-3.5 text-stone-600" />;
      case 'BANK':
      default:
        return <Building2 className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full p-3.5 rounded-2xl bg-white border transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-stone-900 shadow-md ring-1 ring-stone-900 bg-stone-50/50'
          : 'border-stone-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:border-stone-300 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)] active:scale-[0.98]'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: account.color || '#1C1917' }}
          />
          <span className="font-semibold text-xs text-stone-800 truncate tracking-tight">
            {account.name}
          </span>
        </div>
        <span className="p-1 rounded-lg bg-stone-100 text-stone-600 flex-shrink-0">
          {getAccountIcon(account.type)}
        </span>
      </div>

      <div>
        <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider block mb-0.5">
          Balance
        </span>
        <span className="text-sm font-bold text-stone-900 tracking-tight block truncate">
          {formattedBalance}
        </span>
      </div>
    </div>
  );
};
