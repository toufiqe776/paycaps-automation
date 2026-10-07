import { test } from '@playwright/test';

import { LoginPage } from '../../pages/common/LoginPage';
import { InvoicePage } from '../../pages/admin/InvoicePage';
import { InvoicePaymentPage } from '../../pages/admin/InvoicePaymentPage';

import invoiceData from '../../test-data/admin/invoiceData.json';

test.describe('Admin - Invoice E2E Testing', () => {

  test('Invoice creation and end-to-end payment flow', async ({ page }) => {

    const uniqueInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const data = {
      ...invoiceData,
      invoiceNumber: uniqueInvoiceNumber,
    };

    const loginPage = new LoginPage(page);
    const invoicePage = new InvoicePage(page);

    let paymentWindow;

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!
      );
    });

    await test.step('Step 2: Open Invoice Creation Page', async () => {
      await invoicePage.openCreateInvoice();
    });

    await test.step('Step 3: Select Merchant, Currency and Frequency', async () => {
      await invoicePage.selectMerchant(
        data.merchantSearch,
        new RegExp(data.merchantName, 'i')
      );

      await invoicePage.selectCurrency(data.currency);
      await invoicePage.selectFrequency(data.frequency);
    });

    await test.step('Step 4: Enter Customer and Invoice Details', async () => {
      await invoicePage.fillCustomerAndInvoiceDetails(data);
    });

    await test.step('Step 5: Enter Product and SMS Details', async () => {
      await invoicePage.fillProductDetails(data);
    });

    await test.step('Step 6: Continue and Send Invoice', async () => {
      await invoicePage.continueToReview();
      await invoicePage.sendInvoice();
    });

    await test.step('Step 7: Open Invoice Payment Page', async () => {
      paymentWindow = await invoicePage.openPaymentPage();
    });

    const paymentPage = new InvoicePaymentPage(paymentWindow);

    await test.step('Step 8: Complete Payment Details', async () => {
      await paymentPage.payByCard(data);
    });

    await test.step('Step 9: Verify Payment Status', async () => {
      await paymentPage.verifyPaymentStatus(data.expectedStatus);
    });

  });
});