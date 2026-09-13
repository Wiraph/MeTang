import { db } from './index';
import { accounts, categories } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Starting database seed/update...');

  const targetAccounts = [
    { name: 'MAKE', type: 'BANK', currentBalance: '15000.00', color: '#FF9100' },
    { name: 'Dime', type: 'INVESTMENT', currentBalance: '25000.00', color: '#06B6D4' },
    { name: 'MyMo', type: 'BANK', currentBalance: '8500.00', color: '#EC4899' },
    { name: 'Krungthai', type: 'BANK', currentBalance: '0284C7' },
    { name: 'KBank', type: 'BANK', currentBalance: '32000.00', color: '#16A34A' },
    { name: 'TrueMoney', type: 'E_WALLET', currentBalance: '3400.00', color: '#EA580C' },
    { name: 'Cash', type: 'CASH', currentBalance: '2100.00', color: '#64748B' },
  ];

  // 1. Seed or Update Accounts
  const existingAccounts = await db.select().from(accounts);
  if (existingAccounts.length === 0) {
    console.log('Seeding initial 7 wallets...');
    await db.insert(accounts).values(targetAccounts);
    console.log('✅ Accounts seeded successfully.');
  } else {
    console.log('Updating account names to concise format...');
    // Map legacy long names to clean concise names
    for (const acc of existingAccounts) {
      let newName = acc.name;
      if (acc.name.includes('Government Savings Bank') || acc.name.includes('MyMo')) {
        newName = 'MyMo';
      } else if (acc.name.includes('Physical Cash') || acc.name.includes('Cash')) {
        newName = 'Cash';
      } else if (acc.name.includes('MAKE')) {
        newName = 'MAKE';
      } else if (acc.name.includes('Dime')) {
        newName = 'Dime';
      } else if (acc.name.includes('Krungthai')) {
        newName = 'Krungthai';
      } else if (acc.name.includes('K PLUS') || acc.name.includes('KBank')) {
        newName = 'KBank';
      } else if (acc.name.includes('TrueMoney')) {
        newName = 'TrueMoney';
      }

      if (newName !== acc.name) {
        await db.update(accounts).set({ name: newName }).where(eq(accounts.id, acc.id));
        console.log(`Updated account "${acc.name}" -> "${newName}"`);
      }
    }
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
  }

  console.log('🎉 Database seed/update complete.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
