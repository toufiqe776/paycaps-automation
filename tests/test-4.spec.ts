import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://sandbox.paycaps.com/crm/login');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('sayed@paycaps.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Paycaps!@#22');
  await page.getByRole('textbox', { name: 'Captcha' }).click();
 await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('heading', { name: 'Dashboard' }).click();
  await expect(page.getByTestId('dashboard-page')).toContainText('Dashboard');
  await page.getByRole('button', { name: 'Transactions' }).click();
  await expect(page.getByRole('heading')).toContainText('Transactions');
  await expect(page.locator('tbody')).toContainText('1071260930104714');
  await expect(page.locator('tbody')).toContainText('30-09-2026');
  await expect(page.locator('tbody')).toContainText('1000260930104700');
  await expect(page.locator('tbody')).toContainText('Debit Card - Visa');
  await expect(page.locator('tbody')).toContainText('SALE');
  await expect(page.locator('tbody')).toContainText('Captured');
  await expect(page.locator('tbody')).toContainText('EUR');
  await expect(page.locator('tbody')).toContainText('126.00');
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
});