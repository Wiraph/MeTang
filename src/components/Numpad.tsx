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
    <div className="grid grid-cols-3 gap-2.5 w-full my-2">
      {keys.map((key) => {
        const isActionKey = key === 'C' || key === 'DEL';
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            className={`h-12 border-2 border-black rounded-xl font-black text-xl flex items-center justify-center transition-all select-none ${
              isActionKey
                ? 'bg-amber-200 text-black shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                : 'bg-white text-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]'
            }`}
          >
            {key === 'DEL' ? (
              <Delete className="w-5 h-5" />
            ) : key === 'C' ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
};
