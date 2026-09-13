import { getDashboardDataAction } from '@/actions/transactions';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { accountsList, categoriesList, recentTransactions } = await getDashboardDataAction();

  return (
    <DashboardClient
      initialAccounts={accountsList}
      initialCategories={categoriesList}
      initialTransactions={recentTransactions}
    />
  );
}
