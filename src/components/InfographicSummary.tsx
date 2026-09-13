'use client';

import React, { useState, useMemo } from 'react';
import { Account, Category, ExtendedTransaction } from '@/types';
import { RefreshCw, Calendar, PieChart, Wallet, ArrowUpDown, Tag } from 'lucide-react';

interface InfographicSummaryProps {
  accounts: Account[];
  categories: Category[];
  transactions: ExtendedTransaction[];
}

type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export const InfographicSummary: React.FC<InfographicSummaryProps> = ({
  accounts,
  categories,
  transactions,
}) => {
  const [period, setPeriod] = useState<PeriodType>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    const today = new Date();

    return transactions.filter((tx) => {
      const txDateStr = typeof tx.transactionDate === 'string' ? tx.transactionDate : '';
      if (!txDateStr) return true;

      const txDate = new Date(txDateStr);

      if (period === 'DAILY') {
        const todayStr = today.toISOString().split('T')[0];
        return txDateStr === todayStr;
      } else if (period === 'WEEKLY') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return txDate >= sevenDaysAgo && txDate <= today;
      } else if (period === 'MONTHLY') {
        return txDateStr.startsWith(selectedMonth);
      } else if (period === 'YEARLY') {
        const currentYear = selectedMonth.slice(0, 4);
        return txDateStr.startsWith(currentYear);
      }
      return true;
    });
  }, [transactions, period, selectedMonth]);

  // Calculate Category Share (Expenses grouped by category)
  const categoryShare = useMemo(() => {
    const expenseTxs = filteredTransactions.filter((tx) => tx.type === 'EXPENSE');
    const categoryTotals: { [name: string]: { amount: number; color: string } } = {};

    const palette = ['#FF5722', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];
    let paletteIdx = 0;

    let totalExpenseAmount = 0;

    expenseTxs.forEach((tx) => {
      const amt = parseFloat(tx.amount || '0');
      totalExpenseAmount += amt;

      const catName = tx.category?.name || 'อื่นๆ';
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = {
          amount: 0,
          color: palette[paletteIdx % palette.length],
        };
        paletteIdx++;
      }
      categoryTotals[catName].amount += amt;
    });

    const items = Object.entries(categoryTotals).map(([name, data]) => ({
      name,
      amount: data.amount,
      color: data.color,
      percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0,
    }));

    items.sort((a, b) => b.amount - a.amount);
    return { items, totalExpenseAmount };
  }, [filteredTransactions]);

  // Top 5 Expenses
  const topExpenses = useMemo(() => {
    const expenseTxs = filteredTransactions.filter((tx) => tx.type === 'EXPENSE');
    const sorted = [...expenseTxs].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    return sorted.slice(0, 5);
  }, [filteredTransactions]);

  // Format Date Range string (e.g. กันยายน 2569 or September 2026)
  const formatPeriodTitle = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const yearBE = parseInt(yearStr || '2026') + 543;
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const monthIdx = parseInt(monthStr || '01', 10) - 1;
    const monthThai = monthNames[monthIdx] || '';

    if (period === 'DAILY') return `วันนี้ (${new Date().toLocaleDateString('th-TH')})`;
    if (period === 'WEEKLY') return `7 วันที่ผ่านมา`;
    if (period === 'MONTHLY') return `${monthThai} ${yearBE}`;
    if (period === 'YEARLY') return `ปี ${yearBE}`;
    return `${monthThai} ${yearBE}`;
  };

  // SVG Donut Chart Calculation
  const renderDonutChart = () => {
    if (categoryShare.items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 font-bold text-xs">
          <PieChart className="w-12 h-12 mb-2 stroke-1 opacity-50" />
          <span>ไม่มีข้อมูลค่าใช้จ่าย</span>
        </div>
      );
    }

    let cumulativePercent = 0;
    const strokeWidth = 24;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="relative flex flex-col items-center justify-center my-4">
        <svg viewBox="0 0 140 140" className="w-48 h-48 -rotate-90 transform">
          {categoryShare.items.map((item, idx) => {
            const strokeDasharray = `${(item.percentage * circumference) / 100} ${circumference}`;
            const strokeDashoffset = -((cumulativePercent * circumference) / 100);
            cumulativePercent += item.percentage;

            return (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-black uppercase text-gray-500">รวมรายจ่าย</span>
          <span className="text-sm font-black text-black">
            ฿{categoryShare.totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Period Selector Segmented Bar (DAILY | WEEKLY | MONTHLY | YEARLY) */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
        {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as PeriodType[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`py-2 px-1 rounded-lg font-black text-xs uppercase tracking-wider transition-all border border-black ${
              period === p
                ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#000]'
                : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 2. Period Filter Selector Controls */}
      <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-[160px]">
          <span className="text-[10px] font-black uppercase text-gray-500 block mb-0.5">
            เลือกช่วงข้อมูล
          </span>
          <div className="relative">
            <input
              type={period === 'YEARLY' ? 'number' : 'month'}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF9F6] border-2 border-black rounded-lg text-xs font-bold text-black shadow-[2px_2px_0px_#000] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[140px] px-3 py-1.5 bg-gray-200 border-2 border-black rounded-lg text-xs font-bold text-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
          <div>
            <span className="text-[9px] font-black uppercase text-gray-600 block">SHOWING</span>
            <span className="truncate block">{formatPeriodTitle()}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedMonth(new Date().toISOString().slice(0, 7))}
          className="w-9 h-9 border-2 border-black bg-white rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          title="Reset filter"
        >
          <RefreshCw className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* 3. Infographic Two-Column / Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Card: CATEGORY SHARE */}
        <div className="md:col-span-6 bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-black pb-2.5 mb-2">
              <PieChart className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">
                CATEGORY SHARE
              </h3>
            </div>

            {/* Donut Visual */}
            {renderDonutChart()}
          </div>

          {/* Category Legends */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categoryShare.items.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-black">
                  <div
                    className="w-3 h-3 rounded-sm border border-black flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="text-gray-500 text-[10px]">
                    ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stack: ACCOUNT BALANCE & TOP EXPENSES */}
        <div className="md:col-span-6 space-y-4">
          {/* ACCOUNT BALANCE Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2.5 mb-3">
              <Wallet className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">
                ACCOUNT BALANCE
              </h3>
            </div>

            <div className="space-y-2">
              {accounts.map((acc) => {
                const bal = parseFloat(acc.currentBalance || '0');
                const formatted = new Intl.NumberFormat('th-TH', {
                  style: 'currency',
                  currency: 'THB',
                  minimumFractionDigits: 2,
                }).format(bal);

                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span className="font-bold text-xs uppercase tracking-tight text-black truncate">
                        {acc.name}
                      </span>
                    </div>
                    <span className="font-black text-xs text-black flex-shrink-0">
                      {formatted}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP EXPENSES Card */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2.5 mb-3">
              <ArrowUpDown className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">
                TOP EXPENSES
              </h3>
            </div>

            {topExpenses.length === 0 ? (
              <div className="py-4 text-center text-gray-400 font-bold text-xs">
                ไม่มีรายการค่าใช้จ่ายในช่วงเวลานี้
              </div>
            ) : (
              <div className="space-y-2">
                {topExpenses.map((tx, idx) => {
                  const amt = parseFloat(tx.amount || '0');
                  const formattedAmt = new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                    minimumFractionDigits: 2,
                  }).format(amt);

                  return (
                    <div
                      key={tx.id || idx}
                      className="flex items-center justify-between p-2 rounded-xl border border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-4 h-4 rounded-sm border border-black bg-[#FF5722] flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-black truncate">
                            {tx.category?.name || tx.note || 'อื่นๆ'}
                          </div>
                          <div className="text-[10px] font-semibold text-gray-500 truncate">
                            {tx.fromAccount?.name || 'Wallet'}
                          </div>
                        </div>
                      </div>

                      <div className="font-black text-xs text-black flex-shrink-0">
                        {formattedAmt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
