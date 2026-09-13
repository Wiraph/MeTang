'use client';

import React, { useState, useMemo } from 'react';
import { Account, Category, ExtendedTransaction } from '@/types';
import { RefreshCw, PieChart, Wallet, ArrowUpDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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
  const [chartType, setChartType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [topTxType, setTopTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

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

  // Total Income vs Total Expense Summary
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((tx) => {
      const amt = parseFloat(tx.amount || '0');
      if (tx.type === 'INCOME') income += amt;
      if (tx.type === 'EXPENSE') expense += amt;
    });

    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Calculate Category Share for both Expense and Income
  const categoryShare = useMemo(() => {
    const targetTxs = filteredTransactions.filter((tx) => tx.type === chartType);
    const categoryTotals: { [name: string]: { amount: number; color: string } } = {};

    const expensePalette = ['#FF5722', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#64748B'];
    const incomePalette = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
    const palette = chartType === 'EXPENSE' ? expensePalette : incomePalette;

    let paletteIdx = 0;
    let totalAmount = 0;

    targetTxs.forEach((tx) => {
      const amt = parseFloat(tx.amount || '0');
      totalAmount += amt;

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
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));

    items.sort((a, b) => b.amount - a.amount);
    return { items, totalAmount };
  }, [filteredTransactions, chartType]);

  // Top Transactions list (Expense or Income)
  const topTransactions = useMemo(() => {
    const targetTxs = filteredTransactions.filter((tx) => tx.type === topTxType);
    const sorted = [...targetTxs].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    return sorted.slice(0, 5);
  }, [filteredTransactions, topTxType]);

  // Yearly 12-month breakdown for Income vs Expense bar chart
  const yearlyMonthlyBreakdown = useMemo(() => {
    const selectedYearStr = selectedDate.getFullYear().toString();
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthNameShort: THAI_MONTHS_SHORT[i],
      income: 0,
      expense: 0,
    }));

    transactions.forEach((tx) => {
      const txDateStr = normalizeTxDate(tx.transactionDate);
      if (!txDateStr || !txDateStr.startsWith(selectedYearStr)) return;

      const monthIdx = parseInt(txDateStr.slice(5, 7), 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const amt = parseFloat(tx.amount || '0');
        if (tx.type === 'INCOME') monthsData[monthIdx].income += amt;
        if (tx.type === 'EXPENSE') monthsData[monthIdx].expense += amt;
      }
    });

    let maxVal = 0;
    monthsData.forEach((m) => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });

    if (maxVal === 0) maxVal = 10000;

    return { months: monthsData, maxVal };
  }, [transactions, selectedDate]);

  // Render Yearly Income vs Expense Bar Chart
  const renderYearlyBarChart = () => {
    const { months, maxVal } = yearlyMonthlyBreakdown;

    // Y axis ticks (4 intervals)
    const tickStep = maxVal / 4;
    const ticks = [maxVal, tickStep * 3, tickStep * 2, tickStep * 1, 0];

    const formatTick = (val: number) => {
      if (val === 0) return '0k';
      if (val >= 1000) {
        const kVal = val / 1000;
        return `${Number(kVal.toFixed(1))}k`;
      }
      return val.toString();
    };

    const activeMonth = hoveredMonthIdx !== null ? months[hoveredMonthIdx] : null;

    return (
      <div className="bg-white border-2 border-[#121212] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#121212] space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#121212]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
              INCOME VS EXPENSE
            </h3>
          </div>
          <span className="text-xs font-black text-gray-500 font-tabular">
            ปี {selectedDate.getFullYear() + 543}
          </span>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative pt-6 pb-2">
          {/* Tooltip Overlay */}
          {activeMonth && (activeMonth.income > 0 || activeMonth.expense > 0) && (
            <div
              className="absolute z-20 bg-white border-2 border-[#121212] rounded-xl p-3 shadow-[4px_4px_0px_#121212] pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `calc(44px + ${(activeMonth.monthIndex + 0.5) / 12} * (100% - 44px))`,
                top: '25%',
              }}
            >
              <div className="font-black text-xs text-[#121212] mb-1">
                {activeMonth.monthNameShort}
              </div>
              <div className="text-xs font-extrabold text-[#FF5722] font-tabular">
                Expense : ฿{activeMonth.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-extrabold text-[#121212] font-tabular">
                Income : ฿{activeMonth.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div className="flex">
            {/* Y Axis Labels */}
            <div className="flex flex-col justify-between pr-2 text-[10px] sm:text-xs font-black text-gray-500 text-right h-56 select-none w-11 flex-shrink-0">
              {ticks.map((t, idx) => (
                <span key={idx} className="leading-none">
                  {formatTick(t)}
                </span>
              ))}
            </div>

            {/* Chart Grid */}
            <div className="relative flex-1 h-56 border-l-2 border-b-2 border-[#121212] bg-[#FAF9F6] overflow-hidden">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {ticks.map((_, idx) => (
                  <div key={idx} className="border-b border-gray-200 w-full h-0" />
                ))}
              </div>

              {/* 12 Month Columns */}
              <div className="absolute inset-0 grid grid-cols-12 h-full">
                {months.map((m) => {
                  const isHovered = hoveredMonthIdx === m.monthIndex;
                  const incomeHeight = maxVal > 0 ? (m.income / maxVal) * 100 : 0;
                  const expenseHeight = maxVal > 0 ? (m.expense / maxVal) * 100 : 0;

                  return (
                    <div
                      key={m.monthIndex}
                      onMouseEnter={() => setHoveredMonthIdx(m.monthIndex)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      onClick={() => setHoveredMonthIdx(m.monthIndex)}
                      className={`relative flex items-end justify-center gap-0.5 sm:gap-1 px-0.5 h-full cursor-pointer transition-colors border-r border-gray-200 last:border-0 ${
                        isHovered ? 'bg-slate-300/60' : ''
                      }`}
                    >
                      {/* Income Bar (Black) */}
                      <div
                        className="w-1.5 sm:w-3.5 md:w-4.5 bg-[#121212] rounded-t-xs transition-all duration-300 hover:opacity-90"
                        style={{ height: `${Math.max(incomeHeight, m.income > 0 ? 3 : 0)}%` }}
                      />

                      {/* Expense Bar (Orange) */}
                      <div
                        className="w-1.5 sm:w-3.5 md:w-4.5 bg-[#FF5722] rounded-t-xs transition-all duration-300 hover:opacity-90"
                        style={{ height: `${Math.max(expenseHeight, m.expense > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* X Axis Month Labels */}
          <div className="flex pl-11 pt-2 text-[10px] sm:text-xs font-black text-gray-600">
            <div className="grid grid-cols-12 w-full text-center">
              {months.map((m) => (
                <span
                  key={m.monthIndex}
                  className={`truncate ${hoveredMonthIdx === m.monthIndex ? 'text-[#FF5722] font-black' : ''}`}
                >
                  {m.monthNameShort}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t-2 border-[#121212] text-xs font-extrabold text-[#121212]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#FF5722] rounded-xs border border-[#121212]" />
            <span>Expense</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#121212] rounded-xs border border-[#121212]" />
            <span>Income</span>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic Header Title & Active Showing Label
  const getFilterLabels = () => {
    const yearBE = selectedDate.getFullYear() + 543;
    const monthFull = THAI_MONTHS_FULL[selectedDate.getMonth()];

    if (period === 'DAILY') {
      const label = formatThaiDate(selectedDate);
      return { buttonText: label, showingText: label, statPrefix: 'DAILY' };
    } else if (period === 'WEEKLY') {
      const { start, end } = getWeeklyRange(selectedDate);
      const buttonText = formatThaiDate(selectedDate);
      const showingText = `${formatThaiDate(start)} - ${formatThaiDate(end)}`;
      return { buttonText, showingText, statPrefix: 'WEEKLY' };
    } else if (period === 'MONTHLY') {
      const label = `${monthFull} ${yearBE}`;
      return { buttonText: label, showingText: label, statPrefix: 'MONTHLY' };
    } else {
      const label = `ปี ${yearBE}`;
      return { buttonText: label, showingText: label, statPrefix: 'YEARLY' };
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
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 font-bold text-sm w-full">
          <PieChart className="w-16 h-16 mb-3 stroke-1 opacity-40 text-gray-400" />
          <span>ไม่มีข้อมูล{chartType === 'EXPENSE' ? 'ค่าใช้จ่าย' : 'รายรับ'}ช่วงนี้</span>
        </div>
      );
    }

    let cumulativePercent = 0;
    const strokeWidth = 26;
    const radius = 72;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="relative flex items-center justify-center w-full py-2">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 aspect-square flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform drop-shadow-xs">
            {categoryShare.items.map((item, idx) => {
              const strokeDasharray = `${(item.percentage * circumference) / 100} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent * circumference) / 100);
              cumulativePercent += item.percentage;

              return (
                <circle
                  key={idx}
                  cx="100"
                  cy="100"
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

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
              {chartType === 'EXPENSE' ? 'รวมรายจ่าย' : 'รวมรายรับ'}
            </span>
            <span
              className={`font-tabular text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                chartType === 'EXPENSE' ? 'text-[#FF5722]' : 'text-[#10B981]'
              }`}
            >
              ฿{categoryShare.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Calendar Grid (DAILY / WEEKLY)
  const renderCalendarGrid = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    const prevPadding = Array.from({ length: startDayOfWeek }, (_, i) => prevMonthLastDay - startDayOfWeek + i + 1);
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const totalCells = prevPadding.length + currentDays.length;
    const nextPaddingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextPadding = Array.from({ length: nextPaddingCount }, (_, i) => i + 1);

    return (
      <div className="space-y-2">
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

        <div className="grid grid-cols-7 gap-1 text-center font-black text-[11px] text-gray-500 uppercase mb-1">
          <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
        </div>

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

  // Month Picker (MONTHLY)
  const renderMonthPickerGrid = () => {
    return (
      <div className="space-y-3">
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

  // Year Picker (YEARLY)
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

      {/* 3. Hero Financial Summary Cards (Income + Expense + Net Flow) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Income Stat Card */}
        <div className="p-4 bg-white border-2 border-[#121212] rounded-2xl shadow-[4px_4px_0px_#121212] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">
              <TrendingDown className="w-3.5 h-3.5 rotate-180" />
              <span>{labels.statPrefix} INCOME</span>
            </div>
            <span className="font-tabular text-xl sm:text-2xl font-black text-[#10B981]">
              +฿{totals.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Expense Stat Card */}
        <div className="p-4 bg-white border-2 border-[#121212] rounded-2xl shadow-[4px_4px_0px_#121212] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600 tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{labels.statPrefix} EXPENSE</span>
            </div>
            <span className="font-tabular text-xl sm:text-2xl font-black text-[#FF5722]">
              -฿{totals.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Net Flow Stat Card */}
        <div className="p-4 bg-white border-2 border-[#121212] rounded-2xl shadow-[4px_4px_0px_#121212] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-600 tracking-wider mb-1">
              <DollarSign className="w-3.5 h-3.5 text-black" />
              <span>NET CASH FLOW</span>
            </div>
            <span
              className={`font-tabular text-xl sm:text-2xl font-black ${
                totals.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {totals.net >= 0 ? '+' : ''}฿{totals.net.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Yearly Bar Chart (INCOME VS EXPENSE) */}
      {period === 'YEARLY' && renderYearlyBarChart()}

      {/* 5. Infographic Two-Column / Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Card: CATEGORY SHARE (With Expense / Income Switcher) */}
        <div className="md:col-span-6 bg-white border-2 border-[#121212] rounded-2xl p-4 shadow-[4px_4px_0px_#121212] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#121212]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                  CATEGORY SHARE
                </h3>
              </div>

              {/* Toggle Chart Type: Expense vs Income */}
              <div className="flex items-center p-0.5 bg-slate-100 border border-[#121212] rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartType('EXPENSE')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    chartType === 'EXPENSE'
                      ? 'bg-[#FF5722] text-white shadow-[1px_1px_0px_#121212]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('INCOME')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    chartType === 'INCOME'
                      ? 'bg-[#10B981] text-white shadow-[1px_1px_0px_#121212]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Donut Visual */}
            <div className="flex items-center justify-center my-2">
              {renderDonutChart()}
            </div>
          </div>

          {/* Category Progress Bars List */}
          <div className="mt-4 pt-3 border-t-2 border-[#121212] space-y-2.5">
            {categoryShare.items.length === 0 ? (
              <div className="text-center text-xs font-bold text-gray-400 py-2">
                ไม่มีหมวดหมู่ย่อย
              </div>
            ) : (
              categoryShare.items.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-sm border border-[#121212] flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate text-[#121212] font-black">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-tabular font-black text-[#121212]">
                        ฿{cat.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-tabular text-[10px] font-black bg-slate-100 border border-[#121212] px-1.5 py-0.5 rounded-md text-gray-700">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Neo-Brutalist Progress Bar Track */}
                  <div className="w-full h-2.5 bg-slate-100 border border-[#121212] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.max(cat.percentage, 2)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Stack: ACCOUNT BALANCE & TOP TRANSACTIONS */}
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

          {/* TOP TRANSACTIONS Card (Top Expenses vs Top Income) */}
          <div className="bg-white border-2 border-[#121212] rounded-2xl p-4 shadow-[4px_4px_0px_#121212]">
            <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-[#121212]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                  {topTxType === 'EXPENSE' ? 'TOP EXPENSES' : 'TOP INCOME'}
                </h3>
              </div>

              {/* Toggle Top Type */}
              <div className="flex items-center p-0.5 bg-slate-100 border border-[#121212] rounded-lg">
                <button
                  type="button"
                  onClick={() => setTopTxType('EXPENSE')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    topTxType === 'EXPENSE'
                      ? 'bg-[#FF5722] text-white shadow-[1px_1px_0px_#121212]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTopTxType('INCOME')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    topTxType === 'INCOME'
                      ? 'bg-[#10B981] text-white shadow-[1px_1px_0px_#121212]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {topTransactions.length === 0 ? (
              <div className="py-4 text-center text-gray-400 font-bold text-xs">
                ไม่มีรายการ{topTxType === 'EXPENSE' ? 'ค่าใช้จ่าย' : 'รายรับ'}ในช่วงเวลานี้
              </div>
            ) : (
              <div className="space-y-2">
                {topTransactions.map((tx, idx) => {
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
                        <div
                          className={`w-4 h-4 rounded-sm border border-[#121212] flex-shrink-0 ${
                            topTxType === 'EXPENSE' ? 'bg-[#FF5722]' : 'bg-[#10B981]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-[#121212] truncate">
                            {tx.category?.name || tx.note || 'อื่นๆ'}
                          </div>
                          <div className="text-[10px] font-bold text-gray-500 truncate">
                            {tx.fromAccount?.name || tx.toAccount?.name || 'Wallet'}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-tabular font-black text-xs flex-shrink-0 ${
                          topTxType === 'EXPENSE' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {topTxType === 'EXPENSE' ? '-' : '+'}{formattedAmt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Custom Neo-Brutalist Date/Month/Year Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-[#FAF9F6] border-4 border-[#121212] rounded-3xl shadow-[8px_8px_0px_#121212] p-5 z-10 flex flex-col">
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

            <div className="mb-4">
              {period === 'DAILY' || period === 'WEEKLY'
                ? renderCalendarGrid()
                : period === 'MONTHLY'
                ? renderMonthPickerGrid()
                : renderYearPickerGrid()}
            </div>

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
