'use client';

import React, { useState, useMemo, useOptimistic, useTransition } from 'react';
import { Account, Category, ExtendedTransaction, TransactionInput } from '@/types';
import { createTransactionAction } from '@/actions/transactions';
import { AccountCard } from './AccountCard';
import { QuickEntryDrawer } from './QuickEntryDrawer';
import { EditBalancesModal } from './EditBalancesModal';
import { CategoryIcon } from './CategoryIcon';
import { InfographicSummary } from './InfographicSummary';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, LayoutGrid, BarChart2, X, Settings } from 'lucide-react';

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
  const [isEditBalancesOpen, setIsEditBalancesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'infographic'>('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
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

  // Filter transactions by selected account
  const displayedTransactions = useMemo(() => {
    if (!selectedAccountId) return state.transactions;
    return state.transactions.filter(
      (tx) => tx.fromAccountId === selectedAccountId || tx.toAccountId === selectedAccountId
    );
  }, [state.transactions, selectedAccountId]);

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

  const groupedTxs = groupTransactions(displayedTransactions);

  const handleAccountClick = (accountId: string) => {
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    } else {
      setSelectedAccountId(accountId);
      setIsDrawerOpen(true);
    }
  };

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

  const selectedAccountObj = state.accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#121212] pb-28 lg:pb-12 font-sans">
      {/* Container: max-w-xl on mobile, max-w-6xl on desktop */}
      <div className="max-w-xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#121212] text-white flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_#FF5722]">
              M
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#121212] flex items-center gap-2">
                MeTang
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FFD02C] border border-[#121212] shadow-[1px_1px_0px_#121212]">
                  v2.0
                </span>
              </h1>
              <p className="text-xs font-bold text-gray-500">Zero-Friction Finance</p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View Switcher: Dashboard vs Infographic */}
            <div className="flex items-center p-1 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212]">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all border ${
                  activeTab === 'dashboard'
                    ? 'bg-[#121212] text-white border-[#121212] shadow-[1px_1px_0px_#121212]'
                    : 'bg-white text-gray-700 border-transparent hover:text-black'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('infographic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all border ${
                  activeTab === 'infographic'
                    ? 'bg-[#FF5722] text-white border-[#121212] shadow-[1px_1px_0px_#121212]'
                    : 'bg-white text-gray-700 border-transparent hover:text-black'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Infographic</span>
              </button>
            </div>

            {/* Desktop Quick Entry Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121212] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#FF5722] hover:shadow-[4px_4px_0px_#FF5722] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Plus className="w-4 h-4 text-[#FF5722] stroke-[3]" />
              <span>Quick Entry</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {activeTab === 'infographic' ? (
            /* Infographic Analytics View */
            <InfographicSummary
              accounts={state.accounts}
              categories={initialCategories}
              transactions={state.transactions}
            />
          ) : (
            /* Responsive Grid/List Dashboard View */
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
              {/* LEFT COLUMN: Total Net Worth + Wallets Grid */}
              <div className="lg:col-span-7 space-y-6">
                {/* Total Net Worth Hero Card */}
                <div className="p-6 rounded-2xl border-2 border-[#121212] bg-[#FFD02C] shadow-[5px_5px_0px_#121212] relative overflow-hidden">
                  <div className="text-xs font-black uppercase text-[#121212]/80 tracking-wider mb-1 flex items-center justify-between">
                    <span>Total Net Worth</span>
                    <button
                      type="button"
                      onClick={() => setIsEditBalancesOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#121212] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#FFD02C]" />
                      <span>Edit Balances</span>
                    </button>
                  </div>
                  <div className="font-tabular text-3xl sm:text-4xl lg:text-5xl font-black text-[#121212] tracking-tight">
                    {formattedNetWorth}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-[#121212]/80">
                    <Wallet className="w-4 h-4" />
                    <span>Across {state.accounts.length} Wallets & Accounts</span>
                  </div>
                </div>

                {/* Wallets & Accounts Section */}
                <section className="bg-white border-2 border-[#121212] rounded-2xl p-5 shadow-[4px_4px_0px_#121212]">
                  <div className="flex items-center justify-between mb-3.5 border-b-2 border-[#121212] pb-2.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                      Wallets & Accounts ({state.accounts.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditBalancesOpen(true)}
                      className="text-[11px] font-extrabold text-black underline flex items-center gap-1 hover:text-[#FF5722]"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#FF5722]" />
                      <span>Set Balances</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    {state.accounts.map((acc) => (
                      <AccountCard
                        key={acc.id}
                        account={acc}
                        isSelected={selectedAccountId === acc.id}
                        onClick={() => handleAccountClick(acc.id)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: Recent Activity List (Sticky on PC) */}
              <div className="lg:col-span-5">
                <section className="bg-white border-2 border-[#121212] rounded-2xl p-5 shadow-[5px_5px_0px_#121212] lg:sticky lg:top-6">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-[#121212] pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                      Recent Activity
                    </h2>
                    {selectedAccountId && selectedAccountObj && (
                      <button
                        type="button"
                        onClick={() => setSelectedAccountId(null)}
                        className="px-2.5 py-1 rounded-full bg-[#FFD02C] border-2 border-black text-[10px] font-black text-black flex items-center gap-1 shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <span>Filter: {selectedAccountObj.name}</span>
                        <X className="w-3.5 h-3.5 text-black" />
                      </button>
                    )}
                  </div>

                  {displayedTransactions.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 font-bold text-xs">
                      No transactions found for this selection. Tap <span className="text-black font-black">+ Quick Entry</span> below!
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
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
                                    className="flex items-center justify-between p-3 rounded-xl border-2 border-[#121212] bg-[#FAF9F6] shadow-[2px_2px_0px_#121212] hover:shadow-[3px_3px_0px_#121212] transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 text-white font-bold shadow-[1px_1px_0px_#121212] ${
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
                                        <div className="font-extrabold text-xs text-[#121212] truncate">
                                          {tx.note ||
                                            (tx.type === 'TRANSFER'
                                              ? 'Account Transfer'
                                              : tx.category?.name || tx.type)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-bold truncate flex items-center gap-1">
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

                                    <div className="text-right flex-shrink-0 pl-2">
                                      <div
                                        className={`font-tabular font-black text-xs sm:text-sm ${
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
                                      <div className="text-[9px] font-extrabold text-gray-400 uppercase">
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) Centered at Thumb Zone */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="bg-[#121212] text-white px-6 py-3.5 rounded-full border-2 border-[#121212] font-black text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-[4px_4px_0px_#FF5722] hover:shadow-[6px_6px_0px_#FF5722] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#FF5722] transition-all"
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
        defaultAccountId={selectedAccountId}
      />

      {/* Set Balances Modal */}
      <EditBalancesModal
        isOpen={isEditBalancesOpen}
        onClose={() => setIsEditBalancesOpen(false)}
        accounts={state.accounts}
      />
    </div>
  );
};
