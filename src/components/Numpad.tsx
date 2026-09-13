import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';

interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
}

export const Numpad: React.FC<NumpadProps> = ({ value, onChange }) => {
  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      onChange('0');
      return;
    }

    if (key === 'DEL') {
      if (value.length <= 1) {
        onChange('0');
      } else {
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (value.includes('.')) return;
      onChange(value + '.');
      return;
    }

    // Limit decimal precision to 2 decimal places
    if (value.includes('.')) {
      const [, decimalPart] = value.split('.');
      if (decimalPart && decimalPart.length >= 2) return;
    }

    // Prevent excessive length
    if (value.replace('.', '').length >= 9) return;

    if (value === '0') {
      onChange(key);
    } else {
      onChange(value + key);
    }
  };

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'C', '0', 'DEL'
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full my-2">
      {keys.map((key) => {
        const isActionKey = key === 'C' || key === 'DEL';
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            className={`h-12 rounded-2xl font-bold text-lg flex items-center justify-center transition-all select-none border ${
              isActionKey
                ? 'bg-stone-100 border-stone-200/80 text-stone-600 hover:bg-stone-200/80 active:scale-[0.96]'
                : 'bg-white border-stone-200/80 text-stone-900 hover:bg-stone-50 active:scale-[0.96] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]'
            }`}
          >
            {key === 'DEL' ? (
              <Delete className="w-5 h-5 text-stone-500" />
            ) : key === 'C' ? (
              <RotateCcw className="w-5 h-5 text-stone-500" />
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
};
