'use client';

import React from 'react';

interface BankLogoProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function getBankLogoSrc(name: string): string | null {
  const normalized = (name || '').toLowerCase().trim();
  // 1. MyMo
  if (normalized.includes('mymo') || normalized.includes('gsb') || normalized.includes('ออมสิน')) {
    return '/banks/mymo.png';
  }
  // 2. Krungthai
  if (normalized.includes('krungthai') || normalized.includes('ktb') || normalized.includes('กรุงไทย')) {
    return '/banks/krungthai.png';
  }
  // 3. KBank
  if (normalized.includes('kbank') || normalized.includes('k plus') || normalized.includes('kasikorn') || normalized.includes('กสิกร')) {
    return '/banks/kbank.png';
  }
  // 4. MAKE
  if (normalized.includes('make')) {
    return '/banks/make.png';
  }
  // 5. Dime
  if (normalized.includes('dime')) {
    return '/banks/dime.png';
  }
  // 6. TrueMoney / TrueWallet
  if (normalized.includes('truemoney') || normalized.includes('true money') || normalized.includes('truewallet') || normalized.includes('true') || normalized.includes('ทรู')) {
    return '/banks/truemoney.png';
  }
  // 7. เป๋าตัง
  if (normalized.includes('เป๋า') || normalized.includes('paotang')) {
    return '/banks/paotang.png';
  }
  // 8. Cash (เงินสด)
  if (normalized.includes('cash') || normalized.includes('เงินสด')) {
    return '/banks/cash.png';
  }
  return null;
}

export const BankLogo: React.FC<BankLogoProps> = ({ name, size = 'sm', className = '' }) => {
  const logoSrc = getBankLogoSrc(name);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11',
    '2xl': 'w-14 h-14',
  }[size];

  if (logoSrc) {
    return (
      <div
        className={`${sizeClasses} rounded-xl overflow-hidden border border-[#121212] flex items-center justify-center flex-shrink-0 bg-white select-none shadow-xs ${className}`}
        title={name}
      >
        <img
          src={logoSrc}
          alt={name}
          className="w-full h-full object-contain p-0.5"
          loading="eager"
        />
      </div>
    );
  }

  // Fallback for custom accounts
  return (
    <div
      className={`${sizeClasses} rounded-xl bg-slate-800 border border-[#121212] flex items-center justify-center font-black text-white shadow-xs flex-shrink-0 select-none overflow-hidden ${className}`}
      title={name}
    >
      <span className="uppercase font-black text-xs">
        {name.slice(0, 2)}
      </span>
    </div>
  );
};
