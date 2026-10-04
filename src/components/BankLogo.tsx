'use client';

import React from 'react';

interface BankLogoProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ name, size = 'sm', className = '' }) => {
  const normalized = (name || '').toLowerCase().trim();

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
    xl: 'w-10 h-10 text-base',
  }[size];

  // 1. KBank (Kasikorn Bank) - Green #00A950
  if (normalized.includes('kbank') || normalized.includes('k plus') || normalized.includes('kasikorn') || normalized.includes('กสิกร')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#00A950] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="KBank"
      >
        <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
          {/* Classic KBank stylized K symbol */}
          <path
            d="M5 4V20M5 12H9L16 4M9 12L17 20"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 2. Krungthai (KTB) - Sky Blue #00A4E4
  if (normalized.includes('krungthai') || normalized.includes('ktb') || normalized.includes('กรุงไทย')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#00A4E4] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="Krungthai"
      >
        <svg viewBox="0 0 24 24" className="w-[75%] h-[75%]" fill="white">
          {/* Krungthai stylized Vayuphak bird emblem */}
          <path d="M12 2L14.5 7.5L20 8.5L16 12.5L17 18L12 15L7 18L8 12.5L4 8.5L9.5 7.5L12 2Z" fill="white" />
          <circle cx="12" cy="11" r="2" fill="#00A4E4" />
        </svg>
      </div>
    );
  }

  // 3. MyMo (GSB / ธนาคารออมสิน) - Hot Pink #EB198B
  if (normalized.includes('mymo') || normalized.includes('gsb') || normalized.includes('ออมสิน')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#EB198B] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="MyMo (GSB)"
      >
        <span className="font-extrabold tracking-tighter text-[11px] uppercase leading-none">
          GSB
        </span>
      </div>
    );
  }

  // 4. MAKE by KBank - Bright Yellow #FFC700
  if (normalized.includes('make')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#FFC700] border border-[#121212] flex items-center justify-center font-black text-[#121212] shadow-xs flex-shrink-0 select-none ${className}`}
        title="MAKE by KBank"
      >
        <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
          {/* Cloud with M */}
          <path
            d="M6 15C4.34 15 3 13.66 3 12C3 10.45 4.17 9.18 5.68 9.03C6.33 6.69 8.47 5 11 5C14.04 5 16.5 7.46 16.5 10.5C18.43 10.5 20 12.07 20 14C20 15.93 18.43 17.5 16.5 17.5H6"
            stroke="#121212"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFE169"
          />
          <path
            d="M8.5 14L10 10L11.5 12.5L13 10L14.5 14"
            stroke="#121212"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 5. Dime! by KKP - Cyan / Navy #00C2FF
  if (normalized.includes('dime')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#00C2FF] border border-[#121212] flex items-center justify-center font-black text-[#121212] shadow-xs flex-shrink-0 select-none ${className}`}
        title="Dime!"
      >
        <span className="font-black italic text-[11px] leading-none">d!</span>
      </div>
    );
  }

  // 6. TrueMoney Wallet - Orange #FF8200
  if (normalized.includes('truemoney') || normalized.includes('true money') || normalized.includes('ทรู')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#FF8200] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="TrueMoney"
      >
        <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.4" />
          <path d="M7 8h10v3h-3.5v7h-3v-7H7z" fill="white" />
        </svg>
      </div>
    );
  }

  // 7. เป๋าตัง (Paotang) - Blue #0085FF
  if (normalized.includes('เป๋าตัง') || normalized.includes('paotang')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#0085FF] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="เป๋าตัง (Paotang)"
      >
        <svg viewBox="0 0 24 24" className="w-[75%] h-[75%]" fill="none">
          {/* Paotang Wallet shape */}
          <rect x="3" y="5" width="18" height="14" rx="4" fill="white" />
          <path d="M3 10H21" stroke="#0085FF" strokeWidth="1.5" />
          <circle cx="15.5" cy="14" r="1.5" fill="#0085FF" />
          <path d="M8 14C8 14 9.5 15.5 11 14" stroke="#0085FF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 8. Cash (เงินสด) - Emerald #10B981
  if (normalized.includes('cash') || normalized.includes('เงินสด')) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-[#10B981] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
        title="เงินสด (Cash)"
      >
        <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      </div>
    );
  }

  // Fallback for custom or unknown accounts
  return (
    <div
      className={`${sizeClasses} rounded-lg bg-slate-800 border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none ${className}`}
    >
      <span className="uppercase font-black text-[10px]">
        {name.slice(0, 2)}
      </span>
    </div>
  );
};
