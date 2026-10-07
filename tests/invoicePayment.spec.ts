import { test, expect } from '@playwright/test';

test('Invoice creation and end-to-end payment flow', async ({ page }) => {
  // Test run ke hisaab se unique invoice ID generate karein
  const uniqueInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  await page.goto('https://sandbox.paycaps.com/crm/login');

  // --- 1. Login ---
  await page.getByRole('textbox', { name: 'Email Address' }).fill(
    process.env.ADMIN_EMAIL ?? 'sayed@paycaps.com'
  );
  await page.getByRole('textbox', { name: 'Password' }).fill(
    process.env.ADMIN_PASSWORD ?? 'Paycaps!@#22'
  );

  // Manual Captcha entry ke liye wait (Dashboard URL change wait sabse safe rehta hai)
  console.log('Please enter CAPTCHA and submit if needed...');
  await page.waitForTimeout(10000); 

  // Agar captcha manually enter karke sign in nahi dabaya ho tabhi click karein
  const signInBtn = page.getByRole('button', { name: 'Sign In' });
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
  }

  // Ensure dashboard is loaded
  await page.waitForURL(/.*dashboard|crm/i, { timeout: 20000 });

  // --- 2. Navigate to Invoice ---
  await page.getByRole('link', { name: 'Invoice' }).or(page.getByRole('button', { name: 'Invoice' })).click();
  await page.getByRole('button', { name: 'Create' }).click();

  // --- 3. Merchant & Currency Setup ---
  const merchantInput = page.getByRole('combobox', { name: 'Merchant' });
  await merchantInput.fill('qa');
  await page.getByRole('option', { name: /QA Tech Solutions/i }).first().click();

  await page.getByRole('combobox', { name: 'Currency' }).click();
  await page.getByRole('option', { name: 'EUR (978)' }).click();

  await page.getByRole('combobox', { name: 'Recurring frequency' }).click();
  await page.getByRole('option', { name: 'Weekly' }).click();

  // --- 4. Customer & Invoice Info ---
  await page.getByRole('textbox', { name: 'Invoice number' }).fill(uniqueInvoiceNumber);
  await page.getByRole('textbox', { name: 'Phone number' }).first().fill('9988776655');
  await page.getByRole('textbox', { name: 'Email' }).first().fill('qatest@yopmail.com');
  await page.getByRole('textbox', { name: 'First name' }).fill('Sb');
  await page.getByRole('textbox', { name: 'Last name' }).fill('TEch');
  await page.getByRole('textbox', { name: 'Company name' }).fill('QA Tech Solution');
  await page.getByRole('textbox', { name: 'Address' }).fill('Abu Dhabi Street 1');
  await page.getByRole('textbox', { name: 'Town / city' }).fill('Abu Dhabi');

  // Country selection
  const countryDropdown = page.getByRole('combobox', { name: 'Country' });
  await countryDropdown.fill('Saudi');
  const countryOption = page.getByRole('option', { name: /Saudi Arabia/i });
  await expect(countryOption).toBeVisible({ timeout: 10000 });
  await countryOption.click();

  // --- 5. Product Details & SMS Section ---
  await page.getByRole('textbox', { name: 'Product / service name' }).fill('Product 1');
  await page.getByRole('textbox', { name: 'Description' }).fill('Product1');
  await page.getByRole('textbox', { name: 'Expire in (days)' }).fill('1');
  await page.getByRole('textbox', { name: 'Expire in (hours)' }).fill('2');
  await page.getByRole('textbox', { name: 'Quantity' }).fill('12');
  await page.getByRole('textbox', { name: 'Amount', exact: true }).fill('10.00');

  // Send SMS inputs
  const mobileInput = page.getByRole('textbox', { name: 'Mobile number' });
  if (await mobileInput.isVisible()) {
    await mobileInput.fill('9977665544');
  }
  const messageInput = page.getByRole('textbox', { name: 'Message' });
  if (await messageInput.isVisible()) {
    await messageInput.fill('testing invoice link');
  }

  // --- 6. Form Submit & Send Email Modal ---
  await page.getByRole('button', { name: 'Continue' }).click();

  // Modal dialog assertion & click
  const sendEmailButton = page.getByRole('button', { name: 'Send Email' });
  await expect(sendEmailButton).toBeVisible({ timeout: 10000 });
  await sendEmailButton.click();

  // Check for successful creation modal/toast
  await expect(page.getByText(/Invoice created|Invoice generated/i).first()).toBeVisible({
    timeout: 15000,
  });

  // --- 7. Payment Window Handling ---
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open' }).click();
  const paymentPage = await popupPromise;
  await paymentPage.waitForLoadState('networkidle');

  // --- 8. Payment Gateway Execution ---
  await paymentPage.getByRole('checkbox', { name: /agree to the/i }).check();
  await paymentPage.getByRole('button', { name: 'Pay Now' }).click();

  await paymentPage.getByRole('textbox', { name: /XXXX - XXXX/i }).fill('4111 1100 0000 0211');
  await paymentPage.getByRole('textbox', { name: 'MM/YY' }).fill('01/32');
  await paymentPage.getByRole('textbox', { name: 'CVV' }).fill('111');
  await paymentPage.getByRole('textbox', { name: 'Name on Card' }).fill('Test User');

  await paymentPage.getByRole('button', { name: /Pay EUR/i }).click();

  // OTP Simulation
  await paymentPage.locator('#otp').fill('111111');
  await paymentPage.getByRole('button', { name: 'Simulate Success' }).click();

  // Assertion
  await expect(paymentPage.locator('body')).toContainText('Captured', {
    timeout: 20000,
  });
});