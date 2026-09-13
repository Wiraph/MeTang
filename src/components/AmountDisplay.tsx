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

  const displayValue = value ? value : '0';

  return (
    <div className="w-full bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] rounded-xl p-4 text-center my-3 transition-colors">
      <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block mb-1">
        Entered Amount
      </span>
      <div className="flex items-center justify-center gap-1 font-tabular">
        <span className={`text-2xl font-black ${getTypeColor()}`}>฿</span>
        <span className={`text-4xl font-black tracking-tight ${getTypeColor()} truncate`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};
