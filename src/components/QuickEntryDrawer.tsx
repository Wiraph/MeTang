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
}

export const QuickEntryDrawer: React.FC<QuickEntryDrawerProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [activeSlot, setActiveSlot] = useState<'from' | 'to'>('from');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Set default initial account selections when accounts load
  useEffect(() => {
    if (accounts.length > 0) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
      if (!toAccountId && accounts.length > 1) setToAccountId(accounts[1].id);
    }
  }, [accounts, fromAccountId, toAccountId]);

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
      setValidationError('Please enter an amount greater than ฿0');
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
  }, [amountStr, type, fromAccountId, toAccountId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;

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
    onClose();
  };

  const selectedFromAccount = accounts.find((a) => a.id === fromAccountId);
  const selectedToAccount = accounts.find((a) => a.id === toAccountId);
  const availableCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-xs p-0 sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Drawer Sheet */}
      <div className="relative w-full max-w-lg bg-white border-t sm:border border-stone-200 sm:rounded-3xl rounded-t-[2.25rem] shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto z-10 flex flex-col no-scrollbar">
        {/* Top Indicator handle */}
        <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-4" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">Quick Entry</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Type Switch */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100/90 rounded-2xl mb-3 border border-stone-200/60">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`py-2 px-1 rounded-xl font-semibold text-xs transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`py-2 px-1 rounded-xl font-semibold text-xs transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              setType('TRANSFER');
              setActiveSlot('from');
            }}
            className={`py-2 px-1 rounded-xl font-semibold text-xs transition-all ${
              type === 'TRANSFER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Amount Display */}
        <AmountDisplay value={amountStr} type={type} />

        {/* TRANSFER Directional Account Selector */}
        {type === 'TRANSFER' ? (
          <div className="mb-3">
            <label className="text-[11px] font-medium uppercase text-stone-400 tracking-wider block mb-1.5">
              Directional Transfer
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Transfer From Box */}
              <div
                onClick={() => setActiveSlot('from')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  activeSlot === 'from'
                    ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/10'
                    : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-[10px] font-medium uppercase text-stone-400">Transfer From</div>
                <div className="font-semibold text-xs truncate text-stone-900 flex items-center gap-1.5 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedFromAccount?.color || '#000' }}
                  />
                  {selectedFromAccount?.name || 'Select Account'}
                </div>
              </div>

              {/* Transfer To Box */}
              <div
                onClick={() => setActiveSlot('to')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  activeSlot === 'to'
                    ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/10'
                    : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-[10px] font-medium uppercase text-stone-400">Transfer To</div>
                <div className="font-semibold text-xs truncate text-stone-900 flex items-center gap-1.5 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedToAccount?.color || '#000' }}
                  />
                  {selectedToAccount?.name || 'Select Account'}
                </div>
              </div>
            </div>

            {/* Account Chips Selection for Active Slot */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {accounts.map((acc) => {
                const isSelected =
                  activeSlot === 'from' ? fromAccountId === acc.id : toAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      if (activeSlot === 'from') {
                        setFromAccountId(acc.id);
                      } else {
                        setToAccountId(acc.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-100/80 text-stone-700 border-stone-200/80 hover:bg-stone-200'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    {acc.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* EXPENSE / INCOME Single Account Selector */
          <div className="mb-3">
            <label className="text-[11px] font-medium uppercase text-stone-400 tracking-wider block mb-1.5">
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
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-100/80 text-stone-700 border-stone-200/80 hover:bg-stone-200'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
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
            <label className="text-[11px] font-medium uppercase text-stone-400 tracking-wider block mb-1.5">
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
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                        : 'bg-stone-100/80 text-stone-700 border-stone-200/80 hover:bg-stone-200'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-stone-600" />
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
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
          />
        </div>

        {/* Numpad */}
        <Numpad value={amountStr} onChange={setAmountStr} />

        {/* Inline Validation Banner */}
        {validationError && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium mb-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Save Transaction Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!!validationError}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            validationError
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-stone-900 text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 active:scale-[0.98]'
          }`}
        >
          <Check className="w-4 h-4" />
          Save Transaction
        </button>
      </div>
    </div>
  );
};
