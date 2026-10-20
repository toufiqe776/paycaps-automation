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
  }

  /**
   * Navigate to Pay By Link section from admin dashboard
   */
  async openPayByLink(): Promise<void> {
    await this.payByLinkNavButton.click();
    await expect(this.createButton).toBeVisible({ timeout: 15000 });
  }

  /**
   * Fill out the dynamic link creation form and return the generated payment URL
   */
  async generatePaymentLink(data: {
    merchantSearch?: string;
    amount: number;
    customerEmail: string;
    customerName: string;
    phoneNumber?: string;
    purpose?: string;
  }): Promise<string> {
    await this.createButton.click();

    // 1. Dynamic merchant search and selection
    const searchTerm = data.merchantSearch || 'Super Merchant';
    await this.merchantSelect.click();
    await this.merchantSelect.fill(searchTerm);

    const dynamicOption = this.page
      .getByRole('option', { name: new RegExp(searchTerm, 'i') })
      .or(this.page.locator(`[role="option"]:has-text("${searchTerm}")`))
      .or(this.page.getByRole('option'))
      .first();

    await expect(dynamicOption).toBeVisible({ timeout: 15000 });
    await dynamicOption.click();

    // 2. Set dynamic transaction amount
    await this.amountInput.fill(String(data.amount));

    // 3. Populate customer info with standard 9-digit UAE phone number
    await this.customerEmailInput.fill(data.customerEmail);
    await this.customerNameInput.fill(data.customerName);

    const rawPhone = String(data.phoneNumber || '501234567').replace(/\D/g, '');
    const validUaePhone = rawPhone.length > 9 ? rawPhone.slice(-9) : rawPhone.padStart(9, '5');
    await this.phoneNumberInput.fill(validUaePhone);
    await this.phoneNumberInput.blur();

    if (await this.purposeInput.isVisible()) {
      await this.purposeInput.fill(data.purpose || 'Invoice Payment');
    }

    // 4. Proceed to link generation step
    await this.continueButton.scrollIntoViewIfNeeded();
    await expect(this.continueButton).toBeEnabled({ timeout: 10000 });
    await this.continueButton.click();

    // 5. Trigger link generation
    await expect(this.generateLinkButton).toBeVisible({ timeout: 15000 });
    await this.generateLinkButton.click();

    // 6. Extract payment link URL directly from the confirmation modal/screen
    const linkLocator = this.page.locator('text=/https?:\\/\\/[^\\s]+\\/pay\\/[0-9]+/i').first();
    await expect(linkLocator).toBeVisible({ timeout: 20000 });
    const paymentUrl = (await linkLocator.textContent())?.trim();

    return paymentUrl || '';
  }

  /**
   * Launch a clean browser page directly to the payment URL, eliminating popup blocker flakiness
   */
  async openPaymentPage(paymentUrl: string): Promise<Page> {
    const paymentPage = await this.page.context().newPage();
    await paymentPage.goto(paymentUrl, { waitUntil: 'domcontentloaded' });
    return paymentPage;
  }
}