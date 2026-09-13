import React from 'react';
import { TransactionType } from '@/types';
import { RotateCcw } from 'lucide-react';

interface AmountDisplayProps {
  value: string;
  type: TransactionType;
  onClear?: () => void;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ value, type, onClear }) => {
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
    if (val.endsWith('.')) {
      const numPart = parseFloat(val.slice(0, -1));
      return isNaN(numPart) ? '0.' : `${numPart.toLocaleString('en-US')}.`;
    }
    if (val.includes('.')) {
      const [intPart, decPart] = val.split('.');
      const numInt = parseFloat(intPart || '0');
      const formattedInt = isNaN(numInt) ? '0' : numInt.toLocaleString('en-US');
      return `${formattedInt}.${decPart}`;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return `${num.toLocaleString('en-US')}.00`;
  };

  return (
    <div className="relative w-full bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] rounded-xl p-4 text-center my-3 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">
          Entered Amount
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-0.5 rounded-md border border-[#121212] bg-[#FFD02C] text-[10px] font-extrabold uppercase text-black flex items-center gap-1 shadow-[1px_1px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px]"
            title="Clear amount"
          >
            <RotateCcw className="w-3 h-3 text-black" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 font-tabular">
        <span className={`text-2xl font-black ${getTypeColor()}`}>฿</span>
        <span className={`text-4xl font-black tracking-tight ${getTypeColor()} truncate`}>
          {getFormattedDisplay(value)}
        </span>
      </div>
    </div>
  );
};
