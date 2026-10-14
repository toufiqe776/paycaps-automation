// tests/admin/acquirerRouting.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { AcquirerRoutingPage } from '../../pages/admin/AcquirerRoutingPage';
import { StateHelper } from '../../utils/stateHelper';
import routingData from '../../test-data/admin/acquirerRoutingData.json';

test.describe('Admin - Dynamic Acquirer Routing for Created Merchant', () => {

  let loginPage: LoginPage;
  let acquirerRoutingPage: AcquirerRoutingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    acquirerRoutingPage = new AcquirerRoutingPage(page);

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    });

    await test.step('Step 2: Open Acquirer Routing Page', async () => {
      await acquirerRoutingPage.openAcquirerRouting();
    });
  });

  test('Configure routing dynamically for the newly registered merchant', async ({ page }) => {
    // Pichle test me jo merchant bana tha wo dynamically fetch hoga
    const targetMerchant = StateHelper.getCreatedMerchant();
    const timestamp = Date.now().toString().slice(-6);

    console.log(`Configuring Acquirer Routing for Dynamic Merchant: ${targetMerchant}`);

    // Har route ke liye dynamic merchant pass karein
    for (const route of routingData.routes) {
      await test.step(`Create Route [${route.testCase}] for: ${targetMerchant}`, async () => {
        await acquirerRoutingPage.createRoute({
          merchant: targetMerchant, // <-- DYNAMIC MERCHANT USE HO RAHA HAI
          acquirer: routingData.acquirer,
          paymentMethod: route.paymentMethod,
          transactionType: route.transactionType,
          currency: route.currency,
          authenticationType: route.authenticationType,
          merchantId: route.merchantId ? `${route.merchantId}_${timestamp}` : undefined,
          apiKey: `${route.apiKey || 'key'}_${timestamp}`,
          txnKey: `${route.txnKey || 'txn'}_${timestamp}`,
          password: route.password || 'Test@123',
        });
      });
    }

    await test.step('Verify Routes in Grid Table for Dynamic Merchant', async () => {
      await acquirerRoutingPage.filterAndVerifyTable(
        targetMerchant,
        routingData.acquirer,
        [targetMerchant, routingData.acquirer]
      );
    });
  });
});