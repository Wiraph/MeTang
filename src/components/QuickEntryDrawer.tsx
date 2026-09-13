'use client';

import React, { useState, useEffect } from 'react';
import { Account, Category, TransactionType, TransactionInput } from '@/types';
import { Numpad } from './Numpad';
import { AmountDisplay } from './AmountDisplay';
import { CategoryIcon } from './CategoryIcon';
import { X, AlertCircle, Check } from 'lucide-react';

interface QuickEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSubmit: (input: TransactionInput) => void;
  defaultAccountId?: string | null;
}

export const QuickEntryDrawer: React.FC<QuickEntryDrawerProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onSubmit,
  defaultAccountId,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  // Set default initial account selections when accounts load or defaultAccountId changes
  useEffect(() => {
    if (defaultAccountId && accounts.some((a) => a.id === defaultAccountId)) {
      setFromAccountId(defaultAccountId);
      if (accounts.length > 1) {
        const otherAcc = accounts.find((a) => a.id !== defaultAccountId);
        if (otherAcc) setToAccountId(otherAcc.id);
      }
    } else if (accounts.length > 0) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
      if (!toAccountId && accounts.length > 1) {
        const altAcc = accounts.find((a) => a.id !== (fromAccountId || accounts[0].id));
        if (altAcc) setToAccountId(altAcc.id);
      }
    }
  }, [defaultAccountId, accounts, isOpen]);

  // Ensure From and To accounts are never the same bank when in TRANSFER mode
  useEffect(() => {
    if (type === 'TRANSFER' && accounts.length > 1) {
      if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
        const altAccount = accounts.find((a) => a.id !== fromAccountId);
        if (altAccount) setToAccountId(altAccount.id);
      }
    }
  }, [type, fromAccountId, toAccountId, accounts]);

  // Set default category when type changes
  useEffect(() => {
    if (type !== 'TRANSFER') {
      const filtered = categories.filter((c) => c.type === type);
      if (filtered.length > 0 && !filtered.some((c) => c.id === categoryId)) {
        setCategoryId(filtered[0].id);
      }
    }
  }, [type, categories, categoryId]);

  // Validate inputs
  useEffect(() => {
    const numAmount = parseFloat(amountStr);
    if (!amountStr || numAmount <= 0) {
      setValidationError('Please enter an amount greater than ฿0 using Numpad');
      return;
    }

    if (type === 'EXPENSE' && !fromAccountId) {
      setValidationError('Please select a payment account');
      return;
    }

    if (type === 'INCOME' && !toAccountId) {
      setValidationError('Please select a destination account');
      return;
    }

    if (type === 'TRANSFER') {
      if (!fromAccountId || !toAccountId) {
        setValidationError('Please select both source and destination accounts');
        return;
      }
      if (fromAccountId === toAccountId) {
        setValidationError('Source and destination accounts must be different');
        return;
      }
    }

    setValidationError(null);
    setShowErrorAlert(false);
  }, [amountStr, type, fromAccountId, toAccountId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setShowErrorAlert(true);
      return;
    }

    const numAmount = parseFloat(amountStr);
    onSubmit({
      type,
      amount: numAmount,
      fromAccountId: type === 'INCOME' ? null : fromAccountId,
      toAccountId: type === 'EXPENSE' ? null : toAccountId,
      categoryId: type === 'TRANSFER' ? null : categoryId,
      note: note.trim() || null,
      transactionDate: new Date().toISOString().split('T')[0],
    });

    // Reset drawer form state
    setAmountStr('0');
    setNote('');
    setShowErrorAlert(false);
    onClose();
  };

  const availableCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Sheet */}
      <div className="relative w-full max-w-lg bg-[#FAF9F6] border-t-4 sm:border-4 border-[#121212] sm:rounded-2xl shadow-[6px_6px_0px_#121212] p-4 sm:p-6 max-h-[92vh] overflow-y-auto z-10 flex flex-col no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#121212] flex items-center gap-2">
            Quick Entry
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white flex items-center justify-center font-bold shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <X className="w-5 h-5 text-[#121212]" />
          </button>
        </div>

        {/* Segmented Type Switch */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212] mb-3">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`py-2 px-1 rounded-lg font-black text-xs uppercase tracking-wider transition-all border border-[#121212] ${
              type === 'EXPENSE'
                ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                : 'bg-slate-100 text-[#121212] hover:bg-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`py-2 px-1 rounded-lg font-black text-xs uppercase tracking-wider transition-all border border-[#121212] ${
              type === 'INCOME'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#121212]'
                : 'bg-slate-100 text-[#121212] hover:bg-slate-200'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('TRANSFER')}
            className={`py-2 px-1 rounded-lg font-black text-xs uppercase tracking-wider transition-all border border-[#121212] ${
              type === 'TRANSFER'
                ? 'bg-[#3B82F6] text-white shadow-[2px_2px_0px_#121212]'
                : 'bg-slate-100 text-[#121212] hover:bg-slate-200'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Amount Display */}
        <AmountDisplay
          value={amountStr}
          type={type}
          onClear={() => setAmountStr('0')}
        />

        {/* TRANSFER Mode: Separate TRANSFER FROM & TRANSFER TO Grids */}
        {type === 'TRANSFER' ? (
          <div className="space-y-3 mb-3">
            {/* TRANSFER FROM SECTION */}
            <div className="p-3 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212]">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">
                TRANSFER FROM
              </label>
              <div className="grid grid-cols-3 gap-2">
                {accounts.map((acc) => {
                  const isSelected = fromAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setFromAccountId(acc.id);
                        if (toAccountId === acc.id) {
                          const alt = accounts.find((a) => a.id !== acc.id);
                          if (alt) setToAccountId(alt.id);
                        }
                      }}
                      className={`py-2 px-2 rounded-xl border-2 border-[#121212] text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                          : 'bg-white text-[#121212] hover:bg-slate-100 shadow-[1px_1px_0px_#121212]'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span className="truncate">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRANSFER TO SECTION (EXCLUDES selected fromAccountId) */}
            <div className="p-3 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212]">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">
                TRANSFER TO
              </label>
              <div className="grid grid-cols-3 gap-2">
                {accounts
                  .filter((acc) => acc.id !== fromAccountId) // Exclude selected fromAccountId completely!
                  .map((acc) => {
                    const isSelected = toAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setToAccountId(acc.id)}
                        className={`py-2 px-2 rounded-xl border-2 border-[#121212] text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                            : 'bg-white text-[#121212] hover:bg-slate-100 shadow-[1px_1px_0px_#121212]'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0"
                          style={{ backgroundColor: acc.color }}
                        />
                        <span className="truncate">{acc.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          /* EXPENSE / INCOME Single Account Selector */
          <div className="mb-3">
            <label className="text-xs font-black uppercase text-gray-700 tracking-wider block mb-1.5">
              {type === 'EXPENSE' ? 'Pay From Wallet' : 'Deposit To Wallet'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {accounts.map((acc) => {
                const isSelected = type === 'EXPENSE' ? fromAccountId === acc.id : toAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      if (type === 'EXPENSE') setFromAccountId(acc.id);
                      else setToAccountId(acc.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg border-2 border-[#121212] text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#121212] text-white shadow-[2px_2px_0px_#121212]'
                        : 'bg-white text-[#121212] hover:bg-slate-100 shadow-[1px_1px_0px_#121212]'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full border border-black"
                      style={{ backgroundColor: acc.color }}
                    />
                    {acc.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Selector (Hidden for TRANSFER) */}
        {type !== 'TRANSFER' && (
          <div className="mb-3">
            <label className="text-xs font-black uppercase text-gray-700 tracking-wider block mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border-2 border-[#121212] text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFD02C] text-[#121212] shadow-[2px_2px_0px_#121212]'
                        : 'bg-white text-[#121212] hover:bg-slate-100 shadow-[1px_1px_0px_#121212]'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Note Field */}
        <div className="mb-2">
          <input
            type="text"
            placeholder="Add note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-white border-2 border-[#121212] rounded-xl text-xs font-bold text-[#121212] placeholder:text-gray-400 shadow-[2px_2px_0px_#121212] focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Numpad */}
        <Numpad value={amountStr} onChange={setAmountStr} />

        {/* Inline Validation Banner */}
        {(validationError || showErrorAlert) && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-100 border-2 border-[#121212] rounded-xl text-rose-900 text-xs font-bold mb-2 shadow-[2px_2px_0px_#121212] animate-bounce">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{validationError || 'Please enter an amount > ฿0 using Numpad'}</span>
          </div>
        )}

        {/* Save Transaction Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl border-2 border-[#121212] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            validationError
              ? 'bg-amber-300 text-[#121212] shadow-[3px_3px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px]'
              : 'bg-[#121212] text-white shadow-[4px_4px_0px_#FF5722] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#FF5722]'
          }`}
        >
          <Check className="w-5 h-5" />
          Save Transaction
        </button>
      </div>
    </div>
  );
};
