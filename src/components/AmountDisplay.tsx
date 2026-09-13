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
        return 'text-[#FF5722]';
      case 'INCOME':
        return 'text-[#10B981]';
      case 'TRANSFER':
        return 'text-[#3B82F6]';
    }
  };

  const getFormattedDisplay = (val: string) => {
    if (!val || val === '0') return '0.00';
    if (val.endsWith('.')) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';

    if (val.includes('.')) {
      const parts = val.split('.');
      if (parts[1].length === 1) return `${parts[0]}.${parts[1]}0`;
      return val;
    }

    return `${num.toLocaleString('en-US')}.00`;
  };

  return (
    <div className="w-full bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] rounded-xl p-4 text-center my-3 transition-colors">
      <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block mb-1">
        Entered Amount
      </span>
      <div className="flex items-center justify-center gap-1 font-tabular">
        <span className={`text-2xl font-black ${getTypeColor()}`}>฿</span>
        <span className={`text-4xl font-black tracking-tight ${getTypeColor()} truncate`}>
          {getFormattedDisplay(value)}
        </span>
      </div>
    </div>
  );
};
