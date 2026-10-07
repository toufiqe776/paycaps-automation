// spec: test-plans/paycaps-crm-comprehensive.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication and session security', () => {
  test('Authenticate with valid credentials and manually entered CAPTCHA', async ({ page }) => {
    // 1. Start a fresh browser context and navigate to the PayCaps CRM login page.
    await page.goto('https://sandbox.paycaps.com/crm/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Captcha' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reload captcha' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // 2. Enter the authorized email address and password.
    const email = page.getByRole('textbox', { name: 'Email Address' });
    const password = page.getByRole('textbox', { name: 'Password' });
    await email.fill('sayed@paycaps.com');
    await password.fill('Paycaps!@#22');
    await expect(email).toHaveValue('sayed@paycaps.com');
    await expect(password).toHaveAttribute('type', 'password');

    // 3. Enter the CAPTCHA manually, then click Sign In.
    // The CAPTCHA must be entered manually by the tester; this test deliberately does not automate recognition.
    await expect(page).toHaveURL(/\/crm\/dashboard$/);
    await expect(page.getByText('Admin payment overview')).toBeVisible();
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Main navigation' })).toBeVisible();
  });
});
