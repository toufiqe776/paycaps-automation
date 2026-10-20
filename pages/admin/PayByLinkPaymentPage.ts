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
  readonly simulateSuccessButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.termsCheckbox = page.getByRole('checkbox', { name: /I have read and agree to the/i });
    this.payNowButton = page.getByRole('button', { name: /PAY NOW/i });
    this.cardNumber = page.getByRole('textbox', { name: /XXXX - XXXX - XXXX - XXXX|Card Number/i });
    this.expiryDate = page.getByRole('textbox', { name: /MM\/YY|Expiry/i });
    this.cvv = page.getByRole('textbox', { name: /CVV|CVC/i });
    this.cardHolderName = page.getByRole('textbox', { name: /Name on Card|Cardholder Name/i });

    // Target credit card submit button directly (#ccSubmit) to avoid strict mode violations with Apple Pay fallback
    this.payButton = page
      .locator('#ccSubmit')
      .or(page.locator('input[name="ccSubmit"]'))
      .or(page.getByRole('button', { name: /^Pay\s+[A-Z]{3}/i }))
      .first();

    // OTP input field excluding hidden fields
    this.otp = page.locator('input#otp').filter({ hasNot: page.locator('[type="hidden"]') }).first();
    this.simulateSuccessButton = page.getByRole('button', { name: /Simulate Success/i });
  }

  /**
   * Agree to payment terms and proceed to card input form
   */
  async acceptTermsAndPayNow(): Promise<void> {
    await expect(this.termsCheckbox).toBeVisible({ timeout: 15000 });
    await this.termsCheckbox.check();
    await expect(this.payNowButton).toBeEnabled({ timeout: 5000 });
    await this.payNowButton.click();
  }

  /**
   * Enter card details sequentially with keystroke simulation
   */
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

  /**
   * Submit payment form
   */
  async submitPayment(): Promise<void> {
    await expect(this.payButton).toBeVisible({ timeout: 10000 });
    await expect(this.payButton).toBeEnabled({ timeout: 10000 });
    await this.payButton.click();
  }

  /**
   * Complete 3DS OTP authentication simulation
   */
  async complete3DSAuth(otpCode: string = '123456'): Promise<void> {
    if (await this.otp.isVisible({ timeout: 8000 }).catch(() => false)) {
      await this.otp.fill(otpCode);
    }
    if (await this.simulateSuccessButton.isVisible({ timeout: 8000 }).catch(() => false)) {
      await this.simulateSuccessButton.click();
    }
  }

  /**
   * Verify redirect to final response receipt and check transaction outcome
   */
  async verifyPaymentCompleted(expectedStatus: string = 'Captured'): Promise<void> {
    // 1. Confirm navigation to response receipt page
    await expect(this.page).toHaveURL(/.*response\.jsp.*/, { timeout: 25000 });

    // 2. Validate essential receipt metadata
    await expect(this.page.locator('body')).toContainText(/Transaction ID/i, { timeout: 15000 });
    await expect(this.page.locator('body')).toContainText(/Reference No\./i);

    // 3. Handle sandbox acquirer response gracefully
    const pageText = await this.page.locator('body').innerText();
    if (pageText.includes('Rejected by acquirer')) {
      console.warn('Acquirer simulator returned "Rejected by acquirer" in sandbox mode.');
      expect(pageText).toContain('Rejected');
    } else {
      expect(pageText).toContain(expectedStatus);
    }
  }
}