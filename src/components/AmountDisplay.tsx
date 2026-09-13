import React from 'react';
import { TransactionType } from '@/types';

interface AmountDisplayProps {
  value: string;
  type: TransactionType;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ value, type }) => {
  const getTypeColor = () => {
    switch (type) {
      case 'EXPENSE':
        return 'text-rose-600';
      case 'INCOME':
        return 'text-emerald-600';
      case 'TRANSFER':
        return 'text-indigo-600';
    }
  };

  const displayValue = value ? value : '0';

  return (
    <div className="w-full bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 text-center my-3 transition-colors">
      <span className="text-[11px] font-semibold uppercase text-stone-400 tracking-wider block mb-1">
        Amount
      </span>
      <div className="flex items-center justify-center gap-1">
        <span className={`text-2xl font-bold ${getTypeColor()}`}>฿</span>
        <span className={`text-4xl font-extrabold tracking-tight ${getTypeColor()} truncate`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};
