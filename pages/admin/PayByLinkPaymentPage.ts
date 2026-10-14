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
    this.payButton = page.getByRole('button', { name: /^Pay\b/i });
    this.otp = page.locator('#otp, input[name="otp"]');
    this.simulateSuccessButton = page.getByRole('button', { name: /Simulate Success/i });
  }

  async acceptTermsAndPayNow() {
    await expect(this.termsCheckbox).toBeVisible({ timeout: 15000 });
    await this.termsCheckbox.check();
    await expect(this.payNowButton).toBeEnabled({ timeout: 5000 });
    await this.payNowButton.click();
  }

  async enterCardDetails(data: any) {
    await expect(this.cardNumber).toBeVisible({ timeout: 15000 });
    await this.cardNumber.pressSequentially(data.cardNumber.replace(/\s+/g, ''), { delay: 50 });
    await this.expiryDate.pressSequentially(data.expiryDate.replace('/', ''), { delay: 50 });
    await this.cvv.fill(data.cvv);
    await this.cardHolderName.fill(data.cardHolderName);
  }

  async submitPayment() {
    await expect(this.payButton).toBeEnabled({ timeout: 10000 });
    await this.payButton.click();
  }

  async enterOTP(otpCode: string) {
    await this.otp.waitFor({ state: 'visible', timeout: 15000 });
    await this.otp.fill(otpCode);
  }

  async simulateSuccess() {
    await this.simulateSuccessButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.simulateSuccessButton.click();
  }

  async verifyPaymentStatus(expectedStatus: string = 'Captured') {
    await expect(this.page.locator('body')).toContainText(expectedStatus, { timeout: 20000 });
  }
}