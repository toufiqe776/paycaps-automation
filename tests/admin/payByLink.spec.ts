import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { PayByLinkPage } from '../../pages/admin/PayByLinkPage';
import { PayByLinkPaymentPage } from '../../pages/admin/PayByLinkPaymentPage';
import { StateHelper } from '../../utils/stateHelper';

// Standard 3DS Test Card Data (Zero-dependency for CI/CD)
const TEST_CARD = {
  cardNumber: '4111110000000211',
  expiryDate: '12/32',
  cvv: '123',
  cardHolderName: 'Automation Test User'
};

test.describe('Admin - Pay By Link Flow', () => {
  test('Create dynamic payment link and complete 3DS simulation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const payByLinkPage = new PayByLinkPage(page);

    // 1. Newly created merchant fetch (fallback: Super Merchant)
    const dynamicMerchant = StateHelper.getCreatedMerchant();
    
    // 2. Dynamic amount generate (10 se 160 AED ke beech)
    const dynamicAmount = Math.floor(Math.random() * 150) + 10;

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('Step 2: Navigate to Pay By Link', async () => {
      await payByLinkPage.openPayByLink();
    });

    await test.step(`Step 3: Generate Dynamic Link for "${dynamicMerchant}" (AED ${dynamicAmount})`, async () => {
      await payByLinkPage.generatePaymentLink({
        merchantSearch: dynamicMerchant,
        amount: dynamicAmount,
        customerEmail: `customer_${Date.now()}@yopmail.com`,
        customerName: 'Automation Customer',
        phoneNumber: '501234567',
        purpose: `Invoice Ref #${Date.now().toString().slice(-5)}`
      });
    });

    let paymentPage: any;
    await test.step('Step 4: Open Payment Window', async () => {
      paymentPage = await payByLinkPage.openPaymentPage();
    });

    await test.step('Step 5: Complete Card Payment & 3DS Simulation', async () => {
      const pblPayment = new PayByLinkPaymentPage(paymentPage);
      await pblPayment.acceptTermsAndPayNow();
      await pblPayment.enterCardDetails(TEST_CARD);
      await pblPayment.submitPayment();
      await pblPayment.enterOTP('123456');
      await pblPayment.simulateSuccess();
      await pblPayment.verifyPaymentStatus('Captured');
    });
  });
});