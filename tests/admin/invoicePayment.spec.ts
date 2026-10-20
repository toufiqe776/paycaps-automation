// tests/admin/invoicePayment.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { InvoicePage } from '../../pages/admin/InvoicePage';
import { InvoicePaymentPage } from '../../pages/admin/InvoicePaymentPage';
import { TestDataGenerator } from '../../utils/testDataHelper';

test.describe('Admin - Invoice E2E Payment Flow', () => {
  test('Create invoice dynamically and complete payment', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invoicePage = new InvoicePage(page);
    const data = TestDataGenerator.getInvoiceData();

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    });

    await test.step('Step 2: Open Create Invoice Page', async () => {
      await invoicePage.openCreateInvoice();
    });

    await test.step('Step 3: Fill Merchant, Customer, and Product Info', async () => {
      await invoicePage.selectMerchant(data.merchantSearch, new RegExp(data.merchantName, 'i'));
      await invoicePage.selectCurrency(data.currency);
      await invoicePage.selectFrequency(data.frequency);
      await invoicePage.fillCustomerAndInvoiceDetails(data);
      await invoicePage.fillProductDetails(data);
    });

    await test.step('Step 4: Send Invoice', async () => {
      await invoicePage.continueToReview();
      await invoicePage.sendInvoice();
    });

    let paymentWindow: any;
    await test.step('Step 5: Open Payment Link', async () => {
      paymentWindow = await invoicePage.openPaymentPage();
    });

    const paymentPage = new InvoicePaymentPage(paymentWindow);

    await test.step('Step 6: Pay by Card and Verify Captured Status', async () => {
      await paymentPage.payByCard(data);
      await paymentPage.verifyPaymentStatus(data.expectedStatus);
    });
  });
});