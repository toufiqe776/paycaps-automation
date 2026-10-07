import { Page, expect } from '@playwright/test';

export class InvoicePaymentPage {
  constructor(private page: Page) {}

  async payByCard(data: any) {
    await this.page.getByRole('checkbox', { name: /agree to the/i }).check();

    await this.page.getByRole('button', { name: 'Pay Now' }).click();

    await this.page
      .getByRole('textbox', { name: /XXXX - XXXX/i })
      .fill(data.cardNumber);

    await this.page.getByRole('textbox', { name: 'MM/YY' }).fill(data.expiry);
    await this.page.getByRole('textbox', { name: 'CVV' }).fill(data.cvv);
    await this.page.getByRole('textbox', { name: 'Name on Card' }).fill(data.cardHolder);

    await this.page.getByRole('button', { name: /Pay EUR/i }).click();

    await this.page.locator('#otp').fill(data.otp);

    await this.page.getByRole('button', { name: 'Simulate Success' }).click();
  }

  async verifyPaymentStatus(expectedStatus: string) {
    await expect(this.page.locator('body')).toContainText(expectedStatus, {
      timeout: 20000,
    });
  }
}