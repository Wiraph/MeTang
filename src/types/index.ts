import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { accounts, categories, transactions } from '@/db/schema';

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface ExtendedTransaction extends Transaction {
  fromAccount?: Account | null;
  toAccount?: Account | null;
  category?: Category | null;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  note?: string | null;
  transactionDate?: string; // YYYY-MM-DD
}
