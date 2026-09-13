'use client';

import React, { useState, useMemo } from 'react';
import { Account, Category, ExtendedTransaction } from '@/types';
import { RefreshCw, PieChart, Wallet, ArrowUpDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface InfographicSummaryProps {
  accounts: Account[];
  categories: Category[];
  transactions: ExtendedTransaction[];
}

type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const InfographicSummary: React.FC<InfographicSummaryProps> = ({
  accounts,
  categories,
  transactions,
}) => {
  const [period, setPeriod] = useState<PeriodType>('MONTHLY');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  // View state for date/month navigation in picker
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth());

  // Format date to YYYY-MM-DD in local time
  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper to format Thai date string (e.g., 13 ก.ย. 2569)
  const formatThaiDate = (d: Date) => {
    const day = d.getDate();
    const month = THAI_MONTHS_SHORT[d.getMonth()];
    const yearBE = d.getFullYear() + 543;
    return `${day} ${month} ${yearBE}`;
  };

  // Calculate Sunday to Saturday week range for WEEKLY mode
  const getWeeklyRange = (d: Date) => {
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return { start: sunday, end: saturday };
  };

  // Robustly normalize any Date / String representation to YYYY-MM-DD
  const normalizeTxDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      return val.slice(0, 10);
    }
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = (val.getMonth() + 1).toString().padStart(2, '0');
      const d = val.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(val).slice(0, 10);
  };

  // Filter transactions based on period and selectedDate
  const filteredTransactions = useMemo(() => {
    const selectedStr = formatDateKey(selectedDate);
    const yearStr = selectedDate.getFullYear().toString();
    const monthStr = `${yearStr}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const { start: weekStart, end: weekEnd } = getWeeklyRange(selectedDate);
    const weekStartStr = formatDateKey(weekStart);
    const weekEndStr = formatDateKey(weekEnd);

    return transactions.filter((tx) => {
      const txDateStr = normalizeTxDate(tx.transactionDate);
      if (!txDateStr) return false;

      if (period === 'DAILY') {
        return txDateStr === selectedStr;
      } else if (period === 'WEEKLY') {
        return txDateStr >= weekStartStr && txDateStr <= weekEndStr;
      } else if (period === 'MONTHLY') {
        return txDateStr.startsWith(monthStr);
      } else if (period === 'YEARLY') {
        return txDateStr.startsWith(yearStr);
      }
      return true;
    });
  }, [transactions, period, selectedDate]);

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

  // Dynamic Header Title & Active Showing Label
  const getFilterLabels = () => {
    const yearBE = selectedDate.getFullYear() + 543;
    const monthFull = THAI_MONTHS_FULL[selectedDate.getMonth()];
    const monthShort = THAI_MONTHS_SHORT[selectedDate.getMonth()];

    if (period === 'DAILY') {
      const label = formatThaiDate(selectedDate);
      return { buttonText: label, showingText: label, statTitle: 'DAILY EXPENSE' };
    } else if (period === 'WEEKLY') {
      const { start, end } = getWeeklyRange(selectedDate);
      const buttonText = formatThaiDate(selectedDate);
      const showingText = `${formatThaiDate(start)} - ${formatThaiDate(end)}`;
      return { buttonText, showingText, statTitle: 'WEEKLY EXPENSE' };
    } else if (period === 'MONTHLY') {
      const label = `${monthFull} ${yearBE}`;
      return { buttonText: label, showingText: label, statTitle: 'MONTHLY EXPENSE' };
    } else {
      const label = `ปี ${yearBE}`;
      return { buttonText: label, showingText: label, statTitle: 'YEARLY EXPENSE' };
    }
  };

  const labels = getFilterLabels();

  // Reset to today
  const handleResetDate = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // Donut Chart renderer
  const renderDonutChart = () => {
    if (categoryShare.items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 font-bold text-xs">
          <PieChart className="w-12 h-12 mb-2 stroke-1 opacity-50 text-gray-400" />
          <span>ไม่มีข้อมูลค่าใช้จ่ายช่วงนี้</span>
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

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-black uppercase text-gray-500">รวมรายจ่าย</span>
          <span className="font-tabular text-sm font-black text-[#121212]">
            ฿{categoryShare.totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  };

  // Helper to generate days grid for Calendar (DAILY / WEEKLY)
  const renderCalendarGrid = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = lastDayOfMonth.getDate();

    // Prev month padding
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    const prevPadding = Array.from({ length: startDayOfWeek }, (_, i) => prevMonthLastDay - startDayOfWeek + i + 1);

    // Current month days
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Next month padding
    const totalCells = prevPadding.length + currentDays.length;
    const nextPaddingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextPadding = Array.from({ length: nextPaddingCount }, (_, i) => i + 1);

    return (
      <div className="space-y-2">
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border-2 border-[#121212] mb-3">
          <button
            type="button"
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
              } else {
                setViewMonth(viewMonth - 1);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[1px_1px_0px_#121212] hover:bg-amber-100"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <div className="font-black text-sm text-[#121212]">
            {THAI_MONTHS_FULL[viewMonth]} {viewYear + 543}
          </div>
          <button
            type="button"
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
              } else {
                setViewMonth(viewMonth + 1);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[1px_1px_0px_#121212] hover:bg-amber-100"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-black text-[11px] text-gray-500 uppercase mb-1">
          <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {prevPadding.map((day, idx) => (
            <div key={'p-' + idx} className="h-9 flex items-center justify-center text-xs font-bold text-gray-300">
              {day}
            </div>
          ))}

          {currentDays.map((day) => {
            const dateObj = new Date(viewYear, viewMonth, day);
            const isSelected = formatDateKey(dateObj) === formatDateKey(selectedDate);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDate(dateObj);
                  setIsPickerOpen(false);
                }}
                className={`h-9 rounded-lg font-black text-xs transition-all flex items-center justify-center font-tabular border ${
                  isSelected
                    ? 'bg-[#FF5722] text-white border-[#121212] shadow-[2px_2px_0px_#121212] scale-105'
                    : 'bg-white text-[#121212] border-transparent hover:border-[#121212] hover:bg-amber-50'
                }`}
              >
                {day}
              </button>
            );
          })}

          {nextPadding.map((day, idx) => (
            <div key={'n-' + idx} className="h-9 flex items-center justify-center text-xs font-bold text-gray-300">
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to render Month Picker (MONTHLY)
  const renderMonthPickerGrid = () => {
    return (
      <div className="space-y-3">
        {/* Year Navigation Header */}
        <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border-2 border-[#121212] mb-3">
          <button
            type="button"
            onClick={() => setViewYear(viewYear - 1)}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[1px_1px_0px_#121212] hover:bg-amber-100"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <div className="font-black text-sm text-[#121212]">
            ปี {viewYear + 543} ({viewYear})
          </div>
          <button
            type="button"
            onClick={() => setViewYear(viewYear + 1)}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[1px_1px_0px_#121212] hover:bg-amber-100"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* 12 Thai Month Buttons Grid */}
        <div className="grid grid-cols-3 gap-2">
          {THAI_MONTHS_SHORT.map((mName, mIdx) => {
            const isSelected =
              selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === mIdx;
            return (
              <button
                key={mIdx}
                type="button"
                onClick={() => {
                  setSelectedDate(new Date(viewYear, mIdx, 1));
                  setIsPickerOpen(false);
                }}
                className={`py-3 px-2 rounded-xl font-black text-xs transition-all border-2 border-[#121212] ${
                  isSelected
                    ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                    : 'bg-white text-[#121212] hover:bg-amber-50 shadow-[1px_1px_0px_#121212]'
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render Year Picker (YEARLY)
  const renderYearPickerGrid = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    return (
      <div className="space-y-3">
        <div className="text-center font-black text-sm text-[#121212] mb-3">
          เลือกปี พ.ศ. / ค.ศ.
        </div>
        <div className="grid grid-cols-2 gap-2">
          {years.map((y) => {
            const isSelected = selectedDate.getFullYear() === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setSelectedDate(new Date(y, 0, 1));
                  setIsPickerOpen(false);
                }}
                className={`py-3 px-2 rounded-xl font-black text-xs transition-all border-2 border-[#121212] ${
                  isSelected
                    ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                    : 'bg-white text-[#121212] hover:bg-amber-50 shadow-[1px_1px_0px_#121212]'
                }`}
              >
                ปี {y + 543} ({y})
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans relative">
      {/* 1. Period Selector Segmented Bar (DAILY | WEEKLY | MONTHLY | YEARLY) */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212]">
        {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as PeriodType[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPeriod(p);
              setViewYear(selectedDate.getFullYear());
              setViewMonth(selectedDate.getMonth());
            }}
            className={`py-2 px-1 rounded-lg font-black text-xs uppercase tracking-wider transition-all border border-[#121212] ${
              period === p
                ? 'bg-[#FF5722] text-white shadow-[2px_2px_0px_#121212]'
                : 'bg-white text-[#121212] hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 2. Period Filter Controls Bar */}
      <div className="p-3 bg-white border-2 border-[#121212] rounded-xl shadow-[3px_3px_0px_#121212] flex flex-wrap items-end justify-between gap-3">
        {/* Interactive Date Selector Trigger */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
            เลือกช่วงข้อมูล
          </label>
          <button
            type="button"
            onClick={() => {
              setViewYear(selectedDate.getFullYear());
              setViewMonth(selectedDate.getMonth());
              setIsPickerOpen(true);
            }}
            className="w-full h-10 px-3 bg-[#FAF9F6] border-2 border-[#121212] rounded-xl text-xs font-black text-[#121212] shadow-[2px_2px_0px_#121212] flex items-center justify-between hover:bg-amber-50 active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <span className="truncate">{labels.buttonText}</span>
            <CalendarIcon className="w-4 h-4 text-[#FF5722] flex-shrink-0" />
          </button>
        </div>

        {/* Showing Filter Badge */}
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">
            SHOWING
          </label>
          <div className="w-full h-10 px-3 bg-slate-200 border-2 border-[#121212] rounded-xl text-xs font-bold text-[#121212] flex items-center justify-between shadow-[2px_2px_0px_#121212]">
            <span className="truncate block font-bold text-xs">{labels.showingText}</span>
          </div>
        </div>

        {/* Reset Button */}
        <div>
          <label className="text-[10px] font-black uppercase text-transparent block mb-1 select-none">
            RESET
          </label>
          <button
            type="button"
            onClick={handleResetDate}
            className="w-10 h-10 border-2 border-[#121212] bg-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] hover:bg-slate-100 transition-all"
            title="Reset to Today"
          >
            <RefreshCw className="w-4 h-4 text-[#121212]" />
          </button>
        </div>
      </div>

      {/* 3. Expense Total Summary Hero Pill */}
      <div className="p-4 bg-white border-2 border-[#121212] rounded-2xl shadow-[4px_4px_0px_#121212] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
            {labels.statTitle}
          </span>
          <span className="font-tabular text-2xl sm:text-3xl font-black text-[#FF5722]">
            ฿{categoryShare.totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
            TRANSACTIONS
          </span>
          <span className="font-tabular text-xl font-black text-[#121212]">
            {filteredTransactions.length} items
          </span>
        </div>
      </div>

      {/* 4. Infographic Two-Column / Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Card: CATEGORY SHARE */}
        <div className="md:col-span-6 bg-white border-2 border-[#121212] rounded-2xl p-4 shadow-[4px_4px_0px_#121212] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-[#121212] pb-2.5 mb-2">
              <PieChart className="w-5 h-5 text-[#121212]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
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
                <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                  <div
                    className="w-3 h-3 rounded-sm border border-[#121212] flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="font-tabular text-gray-500 text-[10px]">
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
          <div className="bg-white border-2 border-[#121212] rounded-2xl p-4 shadow-[4px_4px_0px_#121212]">
            <div className="flex items-center gap-2 border-b-2 border-[#121212] pb-2.5 mb-3">
              <Wallet className="w-5 h-5 text-[#121212]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
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
                        className="w-2.5 h-2.5 rounded-full border border-[#121212] flex-shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                      <span className="font-bold text-xs uppercase tracking-tight text-[#121212] truncate">
                        {acc.name}
                      </span>
                    </div>
                    <span className="font-tabular font-black text-xs text-[#121212] flex-shrink-0">
                      {formatted}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP EXPENSES Card */}
          <div className="bg-white border-2 border-[#121212] rounded-2xl p-4 shadow-[4px_4px_0px_#121212]">
            <div className="flex items-center gap-2 border-b-2 border-[#121212] pb-2.5 mb-3">
              <ArrowUpDown className="w-5 h-5 text-[#121212]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
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
                      className="flex items-center justify-between p-2 rounded-xl border-2 border-[#121212] bg-[#FAF9F6] shadow-[2px_2px_0px_#121212]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-4 h-4 rounded-sm border border-[#121212] bg-[#FF5722] flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-[#121212] truncate">
                            {tx.category?.name || tx.note || 'อื่นๆ'}
                          </div>
                          <div className="text-[10px] font-bold text-gray-500 truncate">
                            {tx.fromAccount?.name || 'Wallet'}
                          </div>
                        </div>
                      </div>

                      <div className="font-tabular font-black text-xs text-[#121212] flex-shrink-0">
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

      {/* 5. Custom Neo-Brutalist Date/Month/Year Picker Modal (Matches Screenshots 100%) */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-[#FAF9F6] border-4 border-[#121212] rounded-3xl shadow-[8px_8px_0px_#121212] p-5 z-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b-2 border-[#121212] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#FF5722]" />
                <h3 className="text-base font-black uppercase text-[#121212]">
                  {period === 'DAILY' || period === 'WEEKLY'
                    ? 'เลือกวันที่'
                    : period === 'MONTHLY'
                    ? 'เลือกเดือน'
                    : 'เลือกปี'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white flex items-center justify-center font-bold shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px]"
              >
                <X className="w-4 h-4 text-[#121212]" />
              </button>
            </div>

            {/* Content Body */}
            <div className="mb-4">
              {period === 'DAILY' || period === 'WEEKLY'
                ? renderCalendarGrid()
                : period === 'MONTHLY'
                ? renderMonthPickerGrid()
                : renderYearPickerGrid()}
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 border-t-2 border-[#121212] pt-3">
              <button
                type="button"
                onClick={handleResetDate}
                className="py-2.5 rounded-xl border-2 border-[#121212] bg-white text-[#121212] font-black text-xs uppercase shadow-[2px_2px_0px_#121212] hover:bg-slate-100 active:translate-x-[1px] active:translate-y-[1px]"
              >
                {period === 'DAILY' || period === 'WEEKLY'
                  ? 'TODAY'
                  : period === 'MONTHLY'
                  ? 'THIS MONTH'
                  : 'THIS YEAR'}
              </button>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="py-2.5 rounded-xl border-2 border-[#121212] bg-[#121212] text-white font-black text-xs uppercase shadow-[2px_2px_0px_#FF5722] active:translate-x-[1px] active:translate-y-[1px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
