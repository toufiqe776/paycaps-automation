import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { PayByLinkPage } from '../../pages/admin/PayByLinkPage';
import { PayByLinkPaymentPage } from '../../pages/admin/PayByLinkPaymentPage';
import { StateHelper } from '../../utils/stateHelper';

// Zero-dependency inline card data for reliable execution on CI runners
const TEST_CARD = {
  cardNumber: '4111110000000211',
  expiryDate: '12/32',
  cvv: '123',
  cardHolderName: 'Automation Test User'
};

test.describe('Admin - Pay By Link Creation and Payment Flow', () => {
  // Extend timeout to 60s for full multi-step 3DS checkout cycle
  test.setTimeout(60000);

  test('Generate dynamic link and complete 3DS card payment', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const payByLinkPage = new PayByLinkPage(page);

    // 1. Fetch dynamically created merchant from previous registration step (fallback: Super Merchant)
    const dynamicMerchant = StateHelper.getCreatedMerchant();

    // 2. Generate random transaction amount (AED 15 - 115)
    const dynamicAmount = Math.floor(Math.random() * 100) + 15;

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('Step 2: Navigate to Pay By Link section', async () => {
      await payByLinkPage.openPayByLink();
    });

    let paymentUrl = '';
    await test.step(`Step 3: Create Dynamic Payment Link for "${dynamicMerchant}" (AED ${dynamicAmount})`, async () => {
      paymentUrl = await payByLinkPage.generatePaymentLink({
        merchantSearch: dynamicMerchant,
        amount: dynamicAmount,
        customerEmail: `customer_${Date.now()}@yopmail.com`,
        customerName: 'Automation Tester',
        phoneNumber: '501234567',
        purpose: `Order Ref #${Date.now().toString().slice(-5)}`
      });

      expect(paymentUrl).toContain('/pay/');
    });

    let paymentPage: any;
    await test.step('Step 4: Open Checkout Window', async () => {
      paymentPage = await payByLinkPage.openPaymentPage(paymentUrl);
    });

    await test.step('Step 5: Fill Card Details, Submit, and Complete 3DS Authentication', async () => {
      const pblPayment = new PayByLinkPaymentPage(paymentPage);

      // Agree to terms and proceed
      await pblPayment.acceptTermsAndPayNow();

      // Enter card credentials
      await pblPayment.enterCardDetails(TEST_CARD);

      // Submit credit card transaction
      await pblPayment.submitPayment();

      // Simulate 3DS OTP verification
      await pblPayment.complete3DSAuth('111111');

      // Verify final receipt and transaction status
      await pblPayment.verifyPaymentCompleted();
    });
  });
});