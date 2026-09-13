'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { Account, Category, ExtendedTransaction, TransactionInput } from '@/types';
import { createTransactionAction } from '@/actions/transactions';
import { AccountCard } from './AccountCard';
import { QuickEntryDrawer } from './QuickEntryDrawer';
import { CategoryIcon } from './CategoryIcon';
import { InfographicSummary } from './InfographicSummary';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, LayoutGrid, BarChart2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'infographic'>('dashboard');
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
    <div className="min-h-screen bg-[#F4F3EF] text-black pb-28">
      {/* Top Header & Net Worth Container */}
      <header className="max-w-xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#FF5722]">
              M
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">MeTang</h1>
              <p className="text-[11px] font-bold text-gray-500">Zero-Friction Finance</p>
            </div>
          </div>

          {/* View Switcher: Dashboard vs Infographic */}
          <div className="flex items-center p-1 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('infographic')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                activeTab === 'infographic'
                  ? 'bg-[#FF5722] text-white shadow-[1px_1px_0px_#000]'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Infographic</span>
            </button>
          </div>
        </div>

        {/* Total Net Worth Card */}
        <div className="p-5 rounded-2xl border-2 border-black bg-[#FFD02C] shadow-[4px_4px_0px_#000] relative overflow-hidden">
          <div className="text-xs font-black uppercase text-black/70 tracking-wider mb-1">
            Total Net Worth
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            {formattedNetWorth}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-black/80">
            <Wallet className="w-4 h-4" />
            <span>Across {state.accounts.length} Wallets</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 mt-4 space-y-6">
        {activeTab === 'infographic' ? (
          /* Infographic Analytics View */
          <InfographicSummary
            accounts={state.accounts}
            categories={initialCategories}
            transactions={state.transactions}
          />
        ) : (
          /* Standard Dashboard View */
          <>
            {/* Account Balances Grid (No horizontal scrolling) */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-black uppercase tracking-wider text-black">
                  Wallets & Accounts ({state.accounts.length})
                </h2>
                <span className="text-[11px] font-bold text-gray-500">All View</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {state.accounts.map((acc) => (
                  <AccountCard key={acc.id} account={acc} />
                ))}
              </div>
            </section>

            {/* Recent Activity List */}
            <section className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
              <h2 className="text-sm font-black uppercase tracking-wider text-black mb-3">
                Recent Activity
              </h2>

              {state.transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-500 font-bold text-xs">
                  No transactions recorded yet. Tap <span className="text-black">+</span> below!
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedTxs).map(([groupTitle, txList]) => {
                    if (txList.length === 0) return null;
                    return (
                      <div key={groupTitle} className="space-y-2">
                        <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-200 pb-1">
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
                                className="flex items-center justify-between p-2.5 rounded-xl border border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000]"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-lg border border-black flex items-center justify-center flex-shrink-0 text-white font-bold ${
                                      tx.type === 'EXPENSE'
                                        ? 'bg-[#FF5722]'
                                        : tx.type === 'INCOME'
                                        ? 'bg-[#10B981]'
                                        : 'bg-[#3B82F6]'
                                    }`}
                                  >
                                    {tx.type === 'TRANSFER' ? (
                                      <ArrowLeftRight className="w-5 h-5" />
                                    ) : tx.category?.icon ? (
                                      <CategoryIcon name={tx.category.icon} className="w-5 h-5" />
                                    ) : tx.type === 'EXPENSE' ? (
                                      <ArrowUpRight className="w-5 h-5" />
                                    ) : (
                                      <ArrowDownLeft className="w-5 h-5" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-black truncate">
                                      {tx.note ||
                                        (tx.type === 'TRANSFER'
                                          ? 'Account Transfer'
                                          : tx.category?.name || tx.type)}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-semibold truncate flex items-center gap-1">
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
                                    className={`font-black text-xs ${
                                      tx.type === 'EXPENSE'
                                        ? 'text-rose-600'
                                        : tx.type === 'INCOME'
                                        ? 'text-emerald-600'
                                        : 'text-blue-600'
                                    }`}
                                  >
                                    {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                                    {formattedAmt}
                                  </div>
                                  <div className="text-[9px] font-bold text-gray-400 uppercase">
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
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) Centered at Thumb Zone */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="bg-black text-white px-6 py-3.5 rounded-full border-2 border-black font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-[4px_4px_0px_#FF5722] hover:shadow-[5px_5px_0px_#FF5722] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#FF5722] transition-all"
        >
          <Plus className="w-5 h-5 text-[#FF5722] stroke-[3]" />
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
