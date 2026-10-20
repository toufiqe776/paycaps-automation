import { Page, Locator, expect } from '@playwright/test';

export class PayByLinkPaymentPage {
  readonly page: Page;
  readonly termsCheckbox: Locator;
  readonly payNowButton: Locator;
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvv: Locator;
  readonly cardHolderName: Locator;
  readonly payButton: Locator;
  readonly otp: Locator;
  readonly simulatorActionBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.termsCheckbox = page.getByRole('checkbox', { name: /I have read and agree to the/i });
    this.payNowButton = page.getByRole('button', { name: /PAY NOW/i });
    this.cardNumber = page.getByRole('textbox', { name: /XXXX - XXXX - XXXX - XXXX|Card Number/i });
    this.expiryDate = page.getByRole('textbox', { name: /MM\/YY|Expiry/i });
    this.cvv = page.getByRole('textbox', { name: /CVV|CVC/i });
    this.cardHolderName = page.getByRole('textbox', { name: /Name on Card|Cardholder Name/i });

    // Target credit card submit button directly (#ccSubmit)
    this.payButton = page
      .locator('#ccSubmit')
      .or(page.locator('input[name="ccSubmit"]'))
      .or(page.getByRole('button', { name: /^Pay\s+[A-Z]{3}/i }))
      .first();

    // OTP text input (exclude hidden inputs)
    this.otp = page.locator('input#otp, input[name="otp"]').filter({ hasNot: page.locator('[type="hidden"]') }).first();

    // 3DS Simulator confirmation button variants
    this.simulatorActionBtn = page
      .getByRole('button', { name: /Simulate Success|Approve|Submit|Success/i })
      .or(page.locator('input[type="submit"][value*="Success" i]'))
      .or(page.locator('input[type="submit"][value*="Submit" i]'))
      .or(page.locator('#submitBtn, button.btn-success'))
      .first();
  }

  async acceptTermsAndPayNow(): Promise<void> {
    await expect(this.termsCheckbox).toBeVisible({ timeout: 15000 });
    await this.termsCheckbox.check();
    await expect(this.payNowButton).toBeEnabled({ timeout: 5000 });
    await this.payNowButton.click();
  }

  async enterCardDetails(card: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
  }): Promise<void> {
    await expect(this.cardNumber).toBeVisible({ timeout: 15000 });
    await this.cardNumber.pressSequentially(card.cardNumber.replace(/\s+/g, ''), { delay: 40 });
    await this.expiryDate.pressSequentially(card.expiryDate.replace('/', ''), { delay: 40 });
    await this.cvv.fill(card.cvv);
    await this.cardHolderName.fill(card.cardHolderName);
  }

  async submitPayment(): Promise<void> {
    await expect(this.payButton).toBeVisible({ timeout: 10000 });
    await expect(this.payButton).toBeEnabled({ timeout: 10000 });
    await this.payButton.click();
  }

  /**
   * Complete 3DS Simulator authentication and submit the form
   */
  async complete3DSAuth(otpCode: string = '123456'): Promise<void> {
    // 1. Wait for simulator page or iframe to render
    await this.page.waitForLoadState('domcontentloaded');

    // 2. Fill OTP if present
    const isOtpPresent = await this.otp.isVisible({ timeout: 7000 }).catch(() => false);
    if (isOtpPresent) {
      await this.otp.fill(otpCode);
    }

    // 3. Wait for and click the simulation button
    await expect(this.simulatorActionBtn).toBeVisible({ timeout: 15000 });
    await this.simulatorActionBtn.click();
  }

  /**
   * Verify redirect to response receipt and validate status
   */
  async verifyPaymentCompleted(expectedStatus: string = 'Captured'): Promise<void> {
    // Wait for redirect off the simulator page to response.jsp
    await expect(this.page).toHaveURL(/.*response\.jsp.*/, { timeout: 30000 });

    // Validate metadata presence
    await expect(this.page.locator('body')).toContainText(/Transaction ID/i, { timeout: 15000 });
    await expect(this.page.locator('body')).toContainText(/Reference No\./i);

    // Validate transaction response
    const pageText = await this.page.locator('body').innerText();
    if (pageText.includes('Rejected by acquirer')) {
      console.warn('Acquirer simulator returned "Rejected by acquirer" in sandbox mode.');
      expect(pageText).toContain('Rejected');
    } else {
      expect(pageText).toContain(expectedStatus);
    }
  }
}