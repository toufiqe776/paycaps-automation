import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/common/LoginPage';
import { TransactionsPage } from '../../pages/admin/TransactionsPage';

import transactionsData from '../../test-data/admin/transactionsData.json';

test.describe('Admin - Transactions Testing', () => {

    let loginPage: LoginPage;
    let transactionsPage: TransactionsPage;

    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page);
        transactionsPage = new TransactionsPage(page);

        await test.step('Step 1: Admin Login', async () => {

            await loginPage.login(
                process.env.ADMIN_EMAIL!,
                process.env.ADMIN_PASSWORD!
            );
        });

        await test.step('Step 2: Verify Dashboard', async () => {

            await expect(page.getByTestId('dashboard-page')).toContainText(
                'Dashboard'
            );
        });

        await test.step('Step 3: Open Transactions', async () => {

            await transactionsPage.openTransactions();
        });
    });

    test('Verify past transaction details and logout', async () => {

        await test.step('Step 4: Filter by Order ID', async () => {

            await transactionsPage.filterByOrderId(transactionsData.orderId);
        });

        await test.step('Step 5: Verify Transaction Details', async () => {

            await transactionsPage.verifyTransaction(transactionsData);
        });

        await test.step('Step 6: Logout', async () => {

            await transactionsPage.logout();
        });
    });
});