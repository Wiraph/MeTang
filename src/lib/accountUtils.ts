export function getAccountOrderRank(name: string): number {
  const n = (name || '').toLowerCase().trim();
  // 1. mymo (GSB / ออมสิน)
  if (n.includes('mymo') || n.includes('gsb') || n.includes('ออมสิน')) return 1;
  // 2. krungthai (KTB / กรุงไทย)
  if (n.includes('krungthai') || n.includes('ktb') || n.includes('กรุงไทย')) return 2;
  // 3. kbank (Kasikorn / K PLUS / กสิกร)
  if (n.includes('kbank') || n.includes('kasikorn') || n.includes('k plus') || n.includes('กสิกร')) return 3;
  // 4. make (MAKE by KBank)
  if (n.includes('make')) return 4;
  // 5. dime (Dime! by KKP)
  if (n.includes('dime')) return 5;
  // 6. truewallet (TrueMoney / True Wallet / ทรูมันนี่)
  if (n.includes('true') || n.includes('wallet') || n.includes('ทรู')) return 6;
  // 7. เป๋าตั้ง (เป๋าตัง / Paotang)
  if (n.includes('เป๋า') || n.includes('paotang')) return 7;
  // 8. cash (เงินสด)
  if (n.includes('cash') || n.includes('เงินสด')) return 8;
  return 99;
}

export function sortAccounts<T extends { name: string }>(accountsList: T[]): T[] {
  return [...accountsList].sort((a, b) => {
    const rankA = getAccountOrderRank(a.name);
    const rankB = getAccountOrderRank(b.name);
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name, 'th');
  });
}
