import { test } from '@playwright/test';

import { LoginPage } from '../../pages/common/LoginPage';
import { PayByLinkPage } from '../../pages/admin/PayByLinkPage';
import { PayByLinkPaymentPage } from '../../pages/admin/PayByLinkPaymentPage';

import payByLinkData from '../../test-data/admin/payByLinkData.json';

test.describe('Admin - Pay By Link E2E Testing', () => {

  for (const data of payByLinkData) {

    test(data.testCase, async ({ page }) => {

      const loginPage = new LoginPage(page);
      const payByLinkPage = new PayByLinkPage(page);

      await test.step('Step 1: Admin Login', async () => {
        await loginPage.login(
          process.env.ADMIN_EMAIL!,
          process.env.ADMIN_PASSWORD!
        );
      });

      await test.step('Step 2: Open Pay By Link', async () => {
        await payByLinkPage.openPayByLink();
      });

      await test.step('Step 3: Generate Payment Link', async () => {
        await payByLinkPage.generatePaymentLink(data);
      });

      let paymentWindow;

      await test.step('Step 4: Open Payment Page', async () => {
        paymentWindow = await payByLinkPage.openPaymentPage();
      });

      const paymentPage = new PayByLinkPaymentPage(paymentWindow!);

      await test.step('Step 5: Click Pay Now', async () => {
        await paymentPage.clickPayNow();
      });

      await test.step('Step 6: Enter Card Details', async () => {
        await paymentPage.enterCardDetails(data);
      });

      await test.step('Step 7: Submit Payment', async () => {
        await paymentPage.submitPayment();
      });

      await test.step('Step 8: Enter OTP', async () => {
        await paymentPage.enterOTP(data.otp);
      });

      await test.step('Step 9: Simulate Success', async () => {
        await paymentPage.simulateSuccess();
      });

      await test.step('Step 10: Verify Payment Status', async () => {
        await paymentPage.verifyPaymentStatus(data.expectedStatus);
      });

    });
  }
});