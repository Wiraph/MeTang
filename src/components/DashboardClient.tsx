'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { Account, Category, ExtendedTransaction, TransactionInput } from '@/types';
import { createTransactionAction } from '@/actions/transactions';
import { AccountCard } from './AccountCard';
import { QuickEntryDrawer } from './QuickEntryDrawer';
import { CategoryIcon } from './CategoryIcon';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, Sparkles } from 'lucide-react';

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

  // Optimistic state sync for zero perceived latency (0ms UI update)
  const [state, setOptimisticState] = useOptimistic<DashboardState, TransactionInput>(
    { accounts: initialAccounts, transactions: initialTransactions },
    (currentState, newTxInput) => {
      const { type, amount, fromAccountId, toAccountId, categoryId, note } = newTxInput;

      // 1. Update Accounts balances optimistically
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

      // 2. Prepend optimistic transaction
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

  // Calculate Net Worth total
  const netWorth = state.accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.currentBalance || '0'),
    0
  );
  const formattedNetWorth = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(netWorth);

  // Group transactions by date
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
    <div className="min-h-screen bg-[#FAFAF7] text-stone-900 pb-28">
      {/* Top Header & Net Worth Container */}
      <header className="max-w-xl mx-auto px-4 pt-8 pb-3">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900">MeTang</h1>
              <p className="text-xs font-medium text-stone-400">Personal Wealth & Wallets</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full border border-stone-200 bg-white text-stone-600 text-xs font-medium shadow-2xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Personal</span>
          </span>
        </div>

        {/* Total Net Worth Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 text-white shadow-xl shadow-stone-900/10 border border-stone-800 relative overflow-hidden">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">
            Total Net Worth
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formattedNetWorth}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-stone-300">
            <Wallet className="w-4 h-4 text-stone-400" />
            <span>Across {state.accounts.length} Active Accounts</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 mt-5 space-y-6">
        {/* Account Balances Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Wallets & Accounts ({state.accounts.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {state.accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </section>

        {/* Recent Activity List */}
        <section className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
            Recent Activity
          </h2>

          {state.transactions.length === 0 ? (
            <div className="py-10 text-center text-stone-400 font-medium text-xs">
              No transactions recorded yet. Tap <span className="text-stone-900 font-bold">+</span> below!
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedTxs).map(([groupTitle, txList]) => {
                if (txList.length === 0) return null;
                return (
                  <div key={groupTitle} className="space-y-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-1">
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
                            className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 transition-colors hover:bg-stone-50"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  tx.type === 'EXPENSE'
                                    ? 'bg-rose-100/80 text-rose-600'
                                    : tx.type === 'INCOME'
                                    ? 'bg-emerald-100/80 text-emerald-600'
                                    : 'bg-indigo-100/80 text-indigo-600'
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
                                <div className="font-semibold text-xs text-stone-900 truncate">
                                  {tx.note ||
                                    (tx.type === 'TRANSFER'
                                      ? 'Account Transfer'
                                      : tx.category?.name || tx.type)}
                                </div>
                                <div className="text-[11px] text-stone-400 font-medium truncate">
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
                              <div className="text-[9px] font-medium text-stone-400 uppercase">
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

      {/* Floating Action Button (FAB) Centered at Thumb Zone */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="bg-stone-900 text-white px-6 py-3.5 rounded-full font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-stone-900/20 hover:bg-stone-800 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 text-stone-300 stroke-[2.5]" />
          <span>Quick Entry</span>
        </button>
      </div>

      {/* Quick Entry Bottom Sheet Drawer */}
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
