import { Page, Locator, expect } from '@playwright/test';

export class PayByLinkPage {
  readonly page: Page;
  readonly payByLinkNavButton: Locator;
  readonly createButton: Locator;
  readonly merchantSelect: Locator;
  readonly amountInput: Locator;
  readonly customerEmailInput: Locator;
  readonly customerNameInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly purposeInput: Locator;
  readonly continueButton: Locator;
  readonly generateLinkButton: Locator;
  readonly openLinkButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payByLinkNavButton = page.getByRole('button', { name: 'Pay By Link' });
    this.createButton = page.getByRole('button', { name: /Create|New/i }).first();
    this.merchantSelect = page.getByRole('combobox', { name: /Merchant/i });
    this.amountInput = page.getByRole('textbox', { name: /Amount/i });
    this.customerEmailInput = page.getByRole('textbox', { name: /Customer Email|Email/i });
    this.customerNameInput = page.getByRole('textbox', { name: /Customer Name|Name/i });
    this.phoneNumberInput = page.getByRole('textbox', { name: /Phone/i });
    this.purposeInput = page.getByRole('textbox', { name: /Purpose/i });
    this.continueButton = page.getByRole('button', { name: /Continue|Next/i });
    this.generateLinkButton = page
      .getByRole('button', { name: /Generate link|Generate|Create Link/i })
      .or(page.locator('button:has-text("Generate")'))
      .first();
    this.openLinkButton = page.getByRole('button', { name: /Open|Copy/i }).first();
  }

  async openPayByLink() {
    await this.payByLinkNavButton.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
  }

  async generatePaymentLink(data: any) {
    await this.createButton.click();

    await this.merchantSelect.click();
    await this.merchantSelect.fill(data.merchantSearch || 'super');
    const merchantOption = this.page.getByRole('option', { name: /Super Merchant/i }).first();
    await expect(merchantOption).toBeVisible({ timeout: 10000 });
    await merchantOption.click();

    await this.amountInput.fill(String(data.amount));
    await this.customerEmailInput.fill(data.customerEmail);
    await this.customerNameInput.fill(data.customerName);

    // UAE (+971) 9-digit validation
    const rawPhone = String(data.phoneNumber || '501234567').replace(/\D/g, '');
    const validUaePhone = rawPhone.length > 9 ? rawPhone.slice(-9) : rawPhone.padStart(9, '5');
    await this.phoneNumberInput.fill(validUaePhone);
    await this.phoneNumberInput.blur();

    if (await this.purposeInput.isVisible()) {
      await this.purposeInput.fill(data.purpose || 'Payment');
    }

    await this.continueButton.scrollIntoViewIfNeeded();
    await expect(this.continueButton).toBeEnabled({ timeout: 10000 });
    await this.continueButton.click();

    await expect(this.generateLinkButton).toBeVisible({ timeout: 15000 });
    await this.generateLinkButton.click();

    await expect(this.openLinkButton).toBeVisible({ timeout: 20000 });
  }

  async openPaymentPage(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 20000 });
    await this.openLinkButton.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForLoadState('load');
    return popup;
  }
}