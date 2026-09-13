import { db } from './index';
import { accounts, categories } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Accounts if empty
  const existingAccounts = await db.select().from(accounts);
  if (existingAccounts.length === 0) {
    console.log('Seeding initial 7 wallets...');
    await db.insert(accounts).values([
      { name: 'MAKE by KBank', type: 'BANK', currentBalance: '15000.00', color: '#FF9100' },
      { name: 'Dime! Financial', type: 'INVESTMENT', currentBalance: '25000.00', color: '#06B6D4' },
      { name: 'Government Savings Bank (MyMo)', type: 'BANK', currentBalance: '8500.00', color: '#EC4899' },
      { name: 'Krungthai NEXT', type: 'BANK', currentBalance: '12000.00', color: '#0284C7' },
      { name: 'K PLUS (KBank)', type: 'BANK', currentBalance: '32000.00', color: '#16A34A' },
      { name: 'TrueMoney Wallet', type: 'E_WALLET', currentBalance: '3400.00', color: '#EA580C' },
      { name: 'Physical Cash', type: 'CASH', currentBalance: '2100.00', color: '#64748B' },
    ]);
    console.log('✅ Accounts seeded successfully.');
  } else {
    console.log('ℹ️ Accounts already exist. Skipping accounts seed.');
  }

  // 2. Seed Categories if empty
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    console.log('Seeding standard categories...');
    await db.insert(categories).values([
      // Expense categories
      { name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils' },
      { name: 'Transportation', type: 'EXPENSE', icon: 'Bus' },
      { name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag' },
      { name: 'Housing & Bills', type: 'EXPENSE', icon: 'Home' },
      { name: 'Investment', type: 'EXPENSE', icon: 'TrendingUp' },
      { name: 'Others', type: 'EXPENSE', icon: 'HelpCircle' },
      // Income categories
      { name: 'Salary', type: 'INCOME', icon: 'Briefcase' },
      { name: 'Freelance', type: 'INCOME', icon: 'Laptop' },
      { name: 'Merchant Sales', type: 'INCOME', icon: 'Store' },
      { name: 'Interest & Dividends', type: 'INCOME', icon: 'Percent' },
      { name: 'Refunds', type: 'INCOME', icon: 'RotateCc' },
      { name: 'Others', type: 'INCOME', icon: 'Coins' },
    ]);
    console.log('✅ Categories seeded successfully.');
  } else {
    console.log('ℹ️ Categories already exist. Skipping categories seed.');
  }

  console.log('🎉 Database seed complete.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
