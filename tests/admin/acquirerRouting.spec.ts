import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { AcquirerRoutingPage } from '../../pages/admin/AcquirerRoutingPage';

import routingData from '../../test-data/admin/acquirerRoutingData.json';

test.describe('Admin - Acquirer Routing', () => {

    let loginPage: LoginPage;
    let acquirerRoutingPage: AcquirerRoutingPage;

    test.beforeEach(async ({ page }) => {

        loginPage = new LoginPage(page);
        acquirerRoutingPage = new AcquirerRoutingPage(page);

        await test.step('Step 1: Admin Login', async () => {

            await loginPage.login(
                process.env.ADMIN_EMAIL!,
                process.env.ADMIN_PASSWORD!
            );
        });

        await test.step('Step 2: Open Acquirer Routing', async () => {

            await acquirerRoutingPage.openAcquirerRouting();
        });
    });

    test('Data-Driven Acquirer Route Creation and Table Verification', async () => {

        // Iterate through all routes defined in JSON data
        for (const route of routingData.routes) {

            await test.step(`Create Route: ${route.testCase}`, async () => {

                await acquirerRoutingPage.createRoute({
                    merchant: routingData.merchant,
                    acquirer: routingData.acquirer,
                    paymentMethod: route.paymentMethod,
                    transactionType: route.transactionType,
                    currency: route.currency,
                    authenticationType: route.authenticationType,
                    merchantId: route.merchantId,
                    apiKey: route.apiKey,
                    txnKey: route.txnKey,
                    password: route.password
                });
            });
        }

        await test.step('Verify Routes in Grid Table', async () => {

            await acquirerRoutingPage.filterAndVerifyTable(
                routingData.merchant,
                routingData.acquirer,
                routingData.expectedTableValues
            );
        });
    });
});