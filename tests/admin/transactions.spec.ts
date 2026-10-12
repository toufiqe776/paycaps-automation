// tests/admin/transactions.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { TransactionsPage } from '../../pages/admin/TransactionsPage';
import transactionsData from '../../test-data/admin/transactionsData.json';

test.describe('Admin - Transactions Verification', () => {
  test('Verify transaction status and search by Order ID', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const transactionsPage = new TransactionsPage(page);

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('Step 2: Verify Dashboard Loading', async () => {
      await expect(page.getByTestId('dashboard-page').or(page.locator('body'))).toContainText(
        /Dashboard/i,
        { timeout: 15000 }
      );
    });

    await test.step('Step 3: Open Transactions Page', async () => {
      await transactionsPage.openTransactions();
    });

    const targetOrderId = process.env.LAST_TRANSACTION_ID || transactionsData.orderId;

    await test.step('Step 4: Filter by Order ID', async () => {
      await transactionsPage.filterByOrderId(targetOrderId);
    });

    await test.step('Step 5: Verify Transaction Record in Table', async () => {
      await transactionsPage.verifyTransaction({
        ...transactionsData,
        orderId: targetOrderId,
      });
    });

    await test.step('Step 6: Admin Logout', async () => {
      await transactionsPage.logout();
    });
  });
});