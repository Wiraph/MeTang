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
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'E_WALLET':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'CASH':
        return <DollarSign className="w-3.5 h-3.5" />;
      case 'BANK':
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full p-3 rounded-xl border-2 border-black bg-white transition-all cursor-pointer ${
        isSelected
          ? 'shadow-[4px_4px_0px_#000] -translate-y-1 ring-2 ring-black'
          : 'shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0"
            style={{ backgroundColor: account.color || '#000' }}
          />
          <span className="font-bold text-xs truncate text-black">{account.name}</span>
        </div>
        <span className="p-1 rounded bg-slate-100 border border-black text-black text-[10px] flex-shrink-0">
          {getAccountIcon(account.type)}
        </span>
      </div>

      <div>
        <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider block">Balance</span>
        <span className="text-sm font-black tracking-tight text-black block truncate">{formattedBalance}</span>
      </div>
    </div>
  );
};
