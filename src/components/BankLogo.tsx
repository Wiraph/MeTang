'use client';

import React from 'react';

interface BankLogoProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    '2xl': 'w-12 h-12 text-lg',
  }[size];

  // 1. MyMo (GSB / ธนาคารออมสิน) - Hot Pink #EB198B
  if (normalized.includes('mymo') || normalized.includes('gsb') || normalized.includes('ออมสิน')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#EB198B] border border-[#121212] flex items-center justify-center text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="MyMo (GSB)"
      >
        <svg viewBox="0 0 40 40" className="w-[82%] h-[82%]" fill="none">
          {/* GSB circular badge outline */}
          <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.6" />
          <circle cx="20" cy="20" r="14.5" stroke="white" strokeWidth="1.8" />
          {/* Wachirawut Royal Crown emblem */}
          <path
            d="M20 7L22 13H18L20 7Z"
            fill="white"
          />
          <path
            d="M16 11L18 14H15L16 11Z"
            fill="white"
          />
          <path
            d="M24 11L25 14H22L24 11Z"
            fill="white"
          />
          {/* Tiered Chatra base */}
          <path
            d="M14 15.5C14 15 17 14.5 20 14.5C23 14.5 26 15 26 15.5L25 18H15L14 15.5Z"
            fill="white"
          />
          {/* MyMo Text */}
          <text
            x="20"
            y="29"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            letterSpacing="-0.5px"
          >
            MyMo
          </text>
        </svg>
      </div>
    );
  }

  // 2. Krungthai (KTB / ธนาคารกรุงไทย) - Sky Blue #00A4E4
  if (normalized.includes('krungthai') || normalized.includes('ktb') || normalized.includes('กรุงไทย')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#00A4E4] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="Krungthai"
      >
        <svg viewBox="0 0 48 48" className="w-[82%] h-[82%]" fill="white">
          {/* Krungthai official Vayuphak Bird emblem */}
          <path d="M24 5C22.8 5 22 5.8 22 6.8C22 7.3 22.2 7.7 22.5 8C21 9 19.8 10.6 19.3 12.5C19 13.6 19 14.8 19.2 16C15.7 13.8 11.7 12.4 7.4 12C8.6 14.8 10.5 17.2 12.9 19C14.7 20.4 16.8 21.4 19 22C17.2 23 15.6 24.4 14.3 26.1C13 27.8 12.2 29.8 12 32C15.2 30.5 18.6 29.7 22.1 29.5C21.6 32 21.8 34.6 22.6 37C23.5 39.5 25.1 41.7 27.1 43.3C27.1 40.8 26.6 38.3 25.6 36C27.3 37.6 28.7 39.5 29.7 41.6C31.5 38.4 32.3 34.7 32.1 31C35.6 31.2 39 32 42.2 33.5C42 31.3 41.2 29.3 39.9 27.6C38.6 25.9 37 24.5 35.2 23.5C37.4 22.9 39.5 21.9 41.3 20.5C43.7 18.7 45.6 16.3 46.8 13.5C42.5 13.9 38.5 15.3 35 17.5C35.2 16.3 35.2 15.1 34.9 14C34.4 12.1 33.2 10.5 31.7 9.5C32 9.2 32.2 8.8 32.2 8.3C32.2 7.3 31.4 6.5 30.2 6.5C29 6.5 28.2 7.3 28.2 8.3C28.2 8.5 28.2 8.7 28.3 8.9C27 8.3 25.5 8 24 8C24 6.3 24 5 24 5Z" />
        </svg>
      </div>
    );
  }

  // 3. KBank (Kasikorn Bank / กสิกรไทย) - Green #00A950
  if (normalized.includes('kbank') || normalized.includes('k plus') || normalized.includes('kasikorn') || normalized.includes('กสิกร')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#00A950] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="KBank (K PLUS)"
      >
        <svg viewBox="0 0 40 40" className="w-[82%] h-[82%]" fill="none">
          {/* Bold stylized K */}
          <path
            d="M8 8V32M8 20H15L24 8M14 20L25 32"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Plus symbol */}
          <path
            d="M29 17V25M25 21H33"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 4. MAKE by KBank - Bright Yellow #FFC700
  if (normalized.includes('make')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#FFC700] border border-[#121212] flex items-center justify-center font-black text-[#121212] shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="MAKE by KBank"
      >
        <svg viewBox="0 0 40 40" className="w-[84%] h-[84%]" fill="none">
          {/* Iconic MAKE cloud */}
          <path
            d="M10 26C6.5 26 4 23.5 4 20C4 16.8 6.5 14.2 9.7 14C11 9.5 15.2 6.5 20 6.5C25.8 6.5 30.5 11 30.5 16.8C34.2 17 37 20 37 23.8C37 27.5 34 30.5 30.2 30.5H10.5"
            fill="#FFE169"
            stroke="#121212"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 'make' text or stylized M inside cloud */}
          <text
            x="19"
            y="24"
            textAnchor="middle"
            fill="#121212"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            letterSpacing="-0.5px"
          >
            make
          </text>
        </svg>
      </div>
    );
  }

  // 5. Dime! by KKP - Cyan / Electric Blue #00C2FF
  if (normalized.includes('dime')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#00C2FF] border border-[#121212] flex items-center justify-center font-black text-[#121212] shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="Dime!"
      >
        <svg viewBox="0 0 40 40" className="w-[82%] h-[82%]" fill="none">
          {/* Iconic Dime! d! typography */}
          <text
            x="18"
            y="28"
            textAnchor="middle"
            fill="#121212"
            fontSize="22"
            fontStyle="italic"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
          >
            d!
          </text>
        </svg>
      </div>
    );
  }

  // 6. TrueMoney Wallet - Orange #FF8200
  if (normalized.includes('truemoney') || normalized.includes('true money') || normalized.includes('truewallet') || normalized.includes('true') || normalized.includes('ทรู')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#FF8200] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="TrueMoney Wallet"
      >
        <svg viewBox="0 0 40 40" className="w-[82%] h-[82%]" fill="none">
          {/* White outer circle */}
          <circle cx="20" cy="20" r="16" fill="white" />
          {/* Orange inner circle */}
          <circle cx="20" cy="20" r="13" fill="#FF8200" />
          {/* True T and loop ribbon */}
          <path
            d="M13 14H27V18.5H22V27H18V18.5H13V14Z"
            fill="white"
          />
          {/* Yellow accent ribbon */}
          <circle cx="25" cy="15" r="2.5" fill="#FFD02C" />
        </svg>
      </div>
    );
  }

  // 7. เป๋าตัง (Paotang) - Blue #0085FF
  if (normalized.includes('เป๋าตัง') || normalized.includes('เป๋าตั้ง') || normalized.includes('paotang')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#0085FF] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="เป๋าตัง (Paotang)"
      >
        <svg viewBox="0 0 40 40" className="w-[82%] h-[82%]" fill="none">
          {/* Paotang white wallet silhouette */}
          <rect x="5" y="10" width="30" height="22" rx="6" fill="white" />
          {/* Wallet flap line */}
          <path
            d="M5 18C12 18 14 20 20 20C26 20 28 18 35 18"
            stroke="#0085FF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Clasp button */}
          <circle cx="27" cy="22" r="3" fill="#0085FF" />
          <circle cx="27" cy="22" r="1.2" fill="white" />
          {/* Smile line */}
          <path
            d="M12 24C13.5 25.5 16.5 25.5 18 24"
            stroke="#0085FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 8. Cash (เงินสด) - Emerald #10B981
  if (normalized.includes('cash') || normalized.includes('เงินสด')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-[#10B981] border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
        title="เงินสด (Cash)"
      >
        <svg viewBox="0 0 40 40" className="w-[80%] h-[80%]" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="32" height="18" rx="3.5" />
          <circle cx="20" cy="20" r="4.5" />
          <path d="M10 20H10.02M30 20H30.02" strokeWidth="3.5" />
        </svg>
      </div>
    );
  }

  // Fallback for custom or unknown accounts
  return (
    <div
      className={`${sizeClasses} rounded-xl bg-slate-800 border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
    >
      <span className="uppercase font-black text-xs">
        {name.slice(0, 2)}
      </span>
    </div>
  );
};
