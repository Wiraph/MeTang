'use client';

import React, { useState, useEffect } from 'react';
import { verifyPinAction } from '@/actions/auth';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface PinLockScreenProps {
  onSuccess: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleKeyPress = async (numStr: string) => {
    if (isSuccess || isVerifying) return;
    if (error) setError(false);

    if (pin.length < 6) {
      const nextPin = pin + numStr;
      setPin(nextPin);

      // Auto-validate via Server Action when 6th digit is entered
      if (nextPin.length === 6) {
        setIsVerifying(true);
        try {
          const isValid = await verifyPinAction(nextPin);
          if (isValid) {
            setIsSuccess(true);
            setTimeout(() => {
              onSuccess();
            }, 400);
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setIsVerifying(false);
            }, 600);
          }
        } catch {
          setError(true);
          setTimeout(() => {
            setPin('');
            setIsVerifying(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    if (isSuccess) return;
    if (error) setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isSuccess) return;
    setError(false);
    setPin('');
  };

  // Keyboard shortcut listener for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess, error]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F3EF] p-4 select-none">
      <div className="w-full max-w-sm bg-[#FAF9F6] border-4 border-[#121212] rounded-3xl shadow-[8px_8px_0px_#121212] p-6 flex flex-col items-center">
        {/* App Logo & Lock Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <img
              src="/icon.svg"
              alt="MeTang Logo"
              className="w-16 h-16 rounded-2xl border-2 border-[#121212] shadow-[4px_4px_0px_#FF5722] object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFD02C] border-2 border-[#121212] flex items-center justify-center shadow-[1px_1px_0px_#121212]">
              <Lock className="w-3.5 h-3.5 text-[#121212] stroke-[3]" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#121212]">MeTang Security</h1>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Enter 6-Digit Security PIN</p>
        </div>

        {/* PIN Dots Display */}
        <div className={`flex items-center justify-center gap-3 mb-6 transition-all ${error ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#121212] transition-all ${
                  isSuccess
                    ? 'bg-[#10B981] scale-110 shadow-[2px_2px_0px_#121212]'
                    : error
                    ? 'bg-rose-500 scale-110 shadow-[2px_2px_0px_#121212]'
                    : isFilled
                    ? 'bg-[#121212] scale-105 shadow-[2px_2px_0px_#FF5722]'
                    : 'bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback Message */}
        <div className="h-6 mb-4 flex items-center justify-center">
          {error && (
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-100 border border-rose-400 px-3 py-1 rounded-full animate-shake">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incorrect PIN. Try again.</span>
            </div>
          )}
          {isSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-400 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PIN Verified</span>
            </div>
          )}
          {!error && !isSuccess && (
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Protected Financial Vault
            </span>
          )}
        </div>

        {/* 0-9 Numpad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl border-2 border-[#121212] bg-white text-xl font-black text-[#121212] shadow-[3px_3px_0px_#121212] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#121212] transition-all flex items-center justify-center font-tabular"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl border-2 border-[#121212] bg-slate-100 text-xs font-black text-gray-700 uppercase tracking-wider shadow-[3px_3px_0px_#121212] hover:bg-rose-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#121212] transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl border-2 border-[#121212] bg-white text-xl font-black text-[#121212] shadow-[3px_3px_0px_#121212] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#121212] transition-all flex items-center justify-center font-tabular"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl border-2 border-[#121212] bg-slate-100 text-[#121212] shadow-[3px_3px_0px_#121212] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#121212] transition-all flex items-center justify-center font-black"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};
