// tests/admin/payByLink.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { PayByLinkPage } from '../../pages/admin/PayByLinkPage';
import { PayByLinkPaymentPage } from '../../pages/admin/PayByLinkPaymentPage';
import { TestDataGenerator } from '../../utils/testDataHelper';

test.describe('Admin - Pay By Link Flow', () => {
  test('Create dynamic payment link and complete 3DS simulation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const payByLinkPage = new PayByLinkPage(page);
    const data = TestDataGenerator.getPayByLinkData();

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('Step 2: Navigate to Pay By Link', async () => {
      await payByLinkPage.openPayByLink();
    });

    await test.step('Step 3: Generate Dynamic Link', async () => {
      await payByLinkPage.generatePaymentLink(data);
    });

    let popupWindow: any;
    await test.step('Step 4: Open Payment Window', async () => {
      popupWindow = await payByLinkPage.openPaymentPage();
    });

    const paymentPage = new PayByLinkPaymentPage(popupWindow);

    await test.step('Step 5: Accept Terms and Enter Card Details', async () => {
      await paymentPage.acceptTermsAndPayNow();
      await paymentPage.enterCardDetails(data);
      await paymentPage.submitPayment();
    });

    await test.step('Step 6: Submit OTP and Verify Captured Status', async () => {
      await paymentPage.enterOTP(data.otp);
      await paymentPage.simulateSuccess();
      await paymentPage.verifyPaymentStatus(data.expectedStatus);
    });
  });
});