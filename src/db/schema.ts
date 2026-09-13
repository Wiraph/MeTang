import { pgTable, uuid, varchar, numeric, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const transactionTypeEnum = pgEnum('transaction_type', ['EXPENSE', 'INCOME', 'TRANSFER']);
export const categoryTypeEnum = pgEnum('category_type', ['EXPENSE', 'INCOME']);

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  currentBalance: numeric('current_balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  color: varchar('color', { length: 50 }).notNull().default('#000000'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'EXPENSE' | 'INCOME'
  icon: varchar('icon', { length: 50 }).notNull().default('HelpCircle'),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // 'EXPENSE' | 'INCOME' | 'TRANSFER'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  fromAccountId: uuid('from_account_id').references(() => accounts.id, { onDelete: 'cascade' }),
  toAccountId: uuid('to_account_id').references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  note: text('note'),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  outgoingTransactions: many(transactions, { relationName: 'fromAccount' }),
  incomingTransactions: many(transactions, { relationName: 'toAccount' }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fromAccount: one(accounts, {
    fields: [transactions.fromAccountId],
    references: [accounts.id],
    relationName: 'fromAccount',
  }),
  toAccount: one(accounts, {
    fields: [transactions.toAccountId],
    references: [accounts.id],
    relationName: 'toAccount',
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));
