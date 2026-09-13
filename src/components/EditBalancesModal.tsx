'use client';

import React, { useState } from 'react';
import { Account } from '@/types';
import { updateAccountBalanceAction } from '@/actions/transactions';
import { X, Check, Wallet } from 'lucide-react';

interface EditBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

export const EditBalancesModal: React.FC<EditBalancesModalProps> = ({
  isOpen,
  onClose,
  accounts,
}) => {
  const [balances, setBalances] = useState<{ [id: string]: string }>(() => {
    const initial: { [id: string]: string } = {};
    accounts.forEach((a) => {
      initial[a.id] = a.currentBalance || '0.00';
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const acc of accounts) {
        const valStr = balances[acc.id] || '0';
        const numVal = parseFloat(valStr);
        if (!isNaN(numVal) && numVal >= 0) {
          await updateAccountBalanceAction(acc.id, numVal);
        }
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update balances.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-4 border-[#121212] rounded-2xl shadow-[6px_6px_0px_#121212] p-5 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#121212] pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#FF5722]" />
            <h2 className="text-lg font-black uppercase tracking-tight text-[#121212]">
              Set Wallet Balances
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white flex items-center justify-center font-bold shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5 text-[#121212]" />
          </button>
        </div>

        <p className="text-xs font-bold text-gray-500 mb-4">
          Enter your actual starting money for each wallet below. It will update live in your Supabase database.
        </p>

        {/* Input fields for 7 wallets */}
        <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1 mb-4 no-scrollbar">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl border-2 border-[#121212] bg-white shadow-[2px_2px_0px_#121212]"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full border border-black flex-shrink-0"
                  style={{ backgroundColor: acc.color }}
                />
                <span className="font-extrabold text-xs text-[#121212] truncate">{acc.name}</span>
              </div>

              <div className="relative w-36">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 font-tabular">
                  ฿
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={balances[acc.id] ?? ''}
                  onChange={(e) =>
                    setBalances({
                      ...balances,
                      [acc.id]: e.target.value,
                    })
                  }
                  className="w-full pl-7 pr-2 py-1.5 bg-[#FAF9F6] border-2 border-[#121212] rounded-lg text-xs font-tabular font-black text-[#121212] shadow-[1px_1px_0px_#121212] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl border-2 border-[#121212] bg-[#FFD02C] text-[#121212] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Check className="w-5 h-5" />
          {isSaving ? 'Saving to Supabase...' : 'Save Real Balances'}
        </button>
      </div>
    </div>
  );
};
