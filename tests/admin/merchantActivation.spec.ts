import { test, expect } from '@playwright/test';
import { MerchantListPage } from '../../pages/admin/MerchantListPage';
import { StateHelper } from '../../utils/stateHelper';

test.describe('Admin - Merchant Activation & Service Configuration', () => {
  let merchantListPage: MerchantListPage;

  test.beforeEach(async ({ page }) => {
    merchantListPage = new MerchantListPage(page);

    const baseUrl = process.env.BASE_URL || 'https://sandbox.paycaps.com';
    const email = process.env.ADMIN_EMAIL || 'qaadmin@yopmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const captcha = process.env.CAPTCHA_CODE || '0000';

    await page.goto(`${baseUrl}/crm/login`);
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('textbox', { name: 'Captcha' }).fill(captcha);
    await page.getByRole('textbox', { name: 'Captcha' }).press('Enter');

    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('Activate dynamic merchant and enable checkout services',{ tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // Sahi method getCreatedMerchant() call kiya gaya
    const dynamicMerchant = StateHelper.getCreatedMerchant();
    console.log(`Activating Merchant: ${dynamicMerchant}`);

    // 1. Navigate to Merchant List
    await merchantListPage.navigateToMerchantList();

    // 2. Filter target merchant
    await merchantListPage.filterByMerchant(dynamicMerchant);

    // 3. Setup, Activate & Enable payment switches
    await merchantListPage.activateMerchantAndConfigureServices();

    // 4. Logout
    await merchantListPage.logout();
  });
});