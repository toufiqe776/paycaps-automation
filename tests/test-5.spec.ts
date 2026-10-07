import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://sandbox.paycaps.com/crm/login');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Paycaps!@#22');
  await page.getByRole('textbox', { name: 'Captcha' }).click();
  await page.getByRole('textbox', { name: 'Captcha' }).fill('6295');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Merchants' }).click();
  await page.getByRole('button', { name: 'User Registration' }).click();
  await expect(page.getByRole('heading')).toContainText('User Registration');
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('Business name is required.');
  await page.getByRole('textbox', { name: 'Business Name' }).click();
  await page.getByRole('textbox', { name: 'Business Name' }).fill('Sb technology');
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('A valid email address is required.');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('sbtest@yopmail.com');
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('Phone number must contain between 10 and 15 digits.');
  await page.getByRole('textbox', { name: 'Mobile / Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Mobile / Phone Number' }).fill('7878765654');
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('Please select an Industry Category for the merchant.');
  await page.getByTestId('admin-merchant-register-page').getByLabel('Industry Category').click();
  await page.getByRole('option', { name: 'Electronics' }).click();
  await page.getByRole('option', { name: 'Other' }).click();
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('Password must be 8-32 characters and contain uppercase, lowercase, digit, and special character (!@,_+/=).');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Admin@123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('button', { name: 'Register User' }).click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match.');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Admin@123');
  await page.getByRole('button', { name: 'Register User' }).click();

  await expect(page.getByRole('heading')).toContainText('Merchant Account Details');
  
});