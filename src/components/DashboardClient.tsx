'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { Account, Category, ExtendedTransaction, TransactionInput } from '@/types';
import { createTransactionAction } from '@/actions/transactions';
import { AccountCard } from './AccountCard';
import { QuickEntryDrawer } from './QuickEntryDrawer';
import { CategoryIcon } from './CategoryIcon';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet } from 'lucide-react';

interface DashboardClientProps {
  initialAccounts: Account[];
  initialCategories: Category[];
  initialTransactions: ExtendedTransaction[];
}

interface DashboardState {
  accounts: Account[];
  transactions: ExtendedTransaction[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  initialAccounts,
  initialCategories,
  initialTransactions,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [state, setOptimisticState] = useOptimistic<DashboardState, TransactionInput>(
    { accounts: initialAccounts, transactions: initialTransactions },
    (currentState, newTxInput) => {
      const { type, amount, fromAccountId, toAccountId, categoryId, note } = newTxInput;

      const updatedAccounts = currentState.accounts.map((acc) => {
        let balance = parseFloat(acc.currentBalance || '0');
        if (type === 'EXPENSE' && acc.id === fromAccountId) {
          balance -= amount;
        } else if (type === 'INCOME' && acc.id === toAccountId) {
          balance += amount;
        } else if (type === 'TRANSFER') {
          if (acc.id === fromAccountId) balance -= amount;
          if (acc.id === toAccountId) balance += amount;
        }
        return {
          ...acc,
          currentBalance: balance.toFixed(2),
        };
      });

      const accountMap = new Map(updatedAccounts.map((a) => [a.id, a]));
      const categoryMap = new Map(initialCategories.map((c) => [c.id, c]));

      const optimisticTx: ExtendedTransaction = {
        id: 'opt-' + Date.now(),
        type,
        amount: amount.toFixed(2),
        fromAccountId: fromAccountId || null,
        toAccountId: toAccountId || null,
        categoryId: categoryId || null,
        note: note || null,
        transactionDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        fromAccount: fromAccountId ? accountMap.get(fromAccountId) || null : null,
        toAccount: toAccountId ? accountMap.get(toAccountId) || null : null,
        category: categoryId ? categoryMap.get(categoryId) || null : null,
      };

      return {
        accounts: updatedAccounts,
        transactions: [optimisticTx, ...currentState.transactions],
      };
    }
  );

  const netWorth = state.accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.currentBalance || '0'),
    0
  );
  const formattedNetWorth = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(netWorth);

  const groupTransactions = (txs: ExtendedTransaction[]) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const groups: { [key: string]: ExtendedTransaction[] } = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    txs.forEach((tx) => {
      const dateStr = typeof tx.transactionDate === 'string' ? tx.transactionDate : today;
      if (dateStr === today) {
        groups.Today.push(tx);
      } else if (dateStr === yesterday) {
        groups.Yesterday.push(tx);
      } else {
        groups.Older.push(tx);
      }
    });

    return groups;
  };

  const groupedTxs = groupTransactions(state.transactions);

  const handleCreateTransaction = (input: TransactionInput) => {
    startTransition(async () => {
      setOptimisticState(input);
      try {
        await createTransactionAction(input);
      } catch (err: any) {
        alert(err.message || 'Failed to record transaction.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-28">
      {/* Top Header & Net Worth Container */}
      <header className="max-w-xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">MeTang</h1>
              <p className="text-[11px] font-medium text-slate-500">Personal Finance</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold tracking-wide">
            PWA Standalone
          </span>
        </div>

        {/* Minimal Net Worth Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            Total Net Worth
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formattedNetWorth}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Across {state.accounts.length} Accounts</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 mt-5 space-y-6">
        {/* Account Balances Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Wallets & Accounts ({state.accounts.length})
            </h2>
            <span className="text-[11px] font-medium text-slate-400">All View</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {state.accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </section>

        {/* Minimal Recent Activity Feed */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Recent Activity
          </h2>

          {state.transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium text-xs">
              No transactions recorded yet. Tap <span className="text-slate-900 font-bold">+</span> below!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTxs).map(([groupTitle, txList]) => {
                if (txList.length === 0) return null;
                return (
                  <div key={groupTitle} className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                      {groupTitle}
                    </div>
                    <div className="space-y-2">
                      {txList.map((tx) => {
                        const amountNum = parseFloat(tx.amount);
                        const formattedAmt = new Intl.NumberFormat('th-TH', {
                          style: 'currency',
                          currency: 'THB',
                          minimumFractionDigits: 2,
                        }).format(amountNum);

                        return (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-medium ${
                                  tx.type === 'EXPENSE'
                                    ? 'bg-rose-500'
                                    : tx.type === 'INCOME'
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-600'
                                }`}
                              >
                                {tx.type === 'TRANSFER' ? (
                                  <ArrowLeftRight className="w-4 h-4" />
                                ) : tx.category?.icon ? (
                                  <CategoryIcon name={tx.category.icon} className="w-4 h-4" />
                                ) : tx.type === 'EXPENSE' ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-slate-900 truncate">
                                  {tx.note ||
                                    (tx.type === 'TRANSFER'
                                      ? 'Account Transfer'
                                      : tx.category?.name || tx.type)}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                                  {tx.type === 'TRANSFER' ? (
                                    <span>
                                      {tx.fromAccount?.name || 'Wallet'} → {tx.toAccount?.name || 'Wallet'}
                                    </span>
                                  ) : (
                                    <span>
                                      {tx.fromAccount?.name || tx.toAccount?.name || 'Wallet'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div
                                className={`font-bold text-xs ${
                                  tx.type === 'EXPENSE'
                                    ? 'text-rose-600'
                                    : tx.type === 'INCOME'
                                    ? 'text-emerald-600'
                                    : 'text-indigo-600'
                                }`}
                              >
                                {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                                {formattedAmt}
                              </div>
                              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                                {tx.type}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="bg-slate-900 text-white px-6 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl shadow-slate-900/25 hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Entry</span>
        </button>
      </div>

      {/* Quick Entry Drawer */}
      <QuickEntryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        accounts={state.accounts}
        categories={initialCategories}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
};
