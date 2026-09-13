'use server';

import { db } from '@/db';
import { accounts, categories, transactions } from '@/db/schema';
import { TransactionInput, Account, Category, ExtendedTransaction } from '@/types';
import { seedDatabase } from '@/db/seed';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getDashboardDataAction(): Promise<{
  accountsList: Account[];
  categoriesList: Category[];
  recentTransactions: ExtendedTransaction[];
}> {
  try {
    let accountsList = await db.select().from(accounts);
    let categoriesList = await db.select().from(categories);

    if (accountsList.length === 0 || categoriesList.length === 0) {
      await seedDatabase();
      accountsList = await db.select().from(accounts);
      categoriesList = await db.select().from(categories);
    }

    const txRecords = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(50);

    const accountMap = new Map(accountsList.map((a) => [a.id, a]));
    const categoryMap = new Map(categoriesList.map((c) => [c.id, c]));

    const recentTransactions: ExtendedTransaction[] = txRecords.map((t) => ({
      ...t,
      fromAccount: t.fromAccountId ? accountMap.get(t.fromAccountId) || null : null,
      toAccount: t.toAccountId ? accountMap.get(t.toAccountId) || null : null,
      category: t.categoryId ? categoryMap.get(t.categoryId) || null : null,
    }));

    return { accountsList, categoriesList, recentTransactions };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw new Error('Could not load financial records.');
  }
}

export async function updateAccountBalanceAction(accountId: string, newBalance: number) {
  if (newBalance < 0) {
    throw new Error('Balance cannot be negative.');
  }

  const amountDecimal = newBalance.toFixed(2);
  await db
    .update(accounts)
    .set({
      currentBalance: amountDecimal,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId));

  revalidatePath('/');
  return { success: true };
}

export async function createTransactionAction(input: TransactionInput) {
  const { type, amount, fromAccountId, toAccountId, categoryId, note, transactionDate } = input;

  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (type === 'TRANSFER' && fromAccountId === toAccountId) {
    throw new Error('Source and destination accounts cannot be the same.');
  }

  if (type === 'EXPENSE' && !fromAccountId) {
    throw new Error('Expense transaction requires a source account.');
  }

  if (type === 'INCOME' && !toAccountId) {
    throw new Error('Income transaction requires a destination account.');
  }

  if (type === 'TRANSFER' && (!fromAccountId || !toAccountId)) {
    throw new Error('Transfer transaction requires both source and destination accounts.');
  }

  const txDate = transactionDate || new Date().toISOString().split('T')[0];
  const amountDecimal = amount.toFixed(2);

  // Execute in ACID transaction
  return await db.transaction(async (tx) => {
    // 1. Process account balance updates
    if (type === 'EXPENSE' && fromAccountId) {
      await tx
        .update(accounts)
        .set({
          currentBalance: sql`${accounts.currentBalance} - ${amountDecimal}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, fromAccountId));
    } else if (type === 'INCOME' && toAccountId) {
      await tx
        .update(accounts)
        .set({
          currentBalance: sql`${accounts.currentBalance} + ${amountDecimal}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, toAccountId));
    } else if (type === 'TRANSFER' && fromAccountId && toAccountId) {
      // Decrement source account
      await tx
        .update(accounts)
        .set({
          currentBalance: sql`${accounts.currentBalance} - ${amountDecimal}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, fromAccountId));

      // Increment destination account
      await tx
        .update(accounts)
        .set({
          currentBalance: sql`${accounts.currentBalance} + ${amountDecimal}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, toAccountId));
    }

    // 2. Insert transaction record
    const [newTx] = await tx
      .insert(transactions)
      .values({
        type,
        amount: amountDecimal,
        fromAccountId: type === 'INCOME' ? null : fromAccountId,
        toAccountId: type === 'EXPENSE' ? null : toAccountId,
        categoryId: type === 'TRANSFER' ? null : categoryId,
        note: note || null,
        transactionDate: txDate,
      })
      .returning();

    revalidatePath('/');

    return { success: true, transaction: newTx };
  });
}
