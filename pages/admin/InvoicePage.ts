import { Page, expect } from '@playwright/test';

export class InvoicePage {
  constructor(private page: Page) {}

  private invoiceMenu = this.page.getByRole('link', { name: 'Invoice' })
    .or(this.page.getByRole('button', { name: 'Invoice' }));

  private createButton = this.page.getByRole('button', { name: 'Create' });

  async openCreateInvoice() {
    await this.invoiceMenu.click();
    await this.createButton.click();
  }

  async selectMerchant(merchantSearch: string, merchantName: RegExp) {
    const merchantInput = this.page.getByRole('combobox', { name: 'Merchant' });
    await merchantInput.fill(merchantSearch);

    const merchantOption = this.page.getByRole('option', { name: merchantName }).first();
    await expect(merchantOption).toBeVisible({ timeout: 10000 });
    await merchantOption.click();
  }

  async selectCurrency(currency: string) {
    await this.page.getByRole('combobox', { name: 'Currency' }).click();
    await this.page.getByRole('option', { name: currency }).click();
  }

  async selectFrequency(frequency: string) {
    await this.page.getByRole('combobox', { name: 'Recurring frequency' }).click();
    await this.page.getByRole('option', { name: frequency }).click();
  }

  async fillCustomerAndInvoiceDetails(data: any) {
    await this.page.getByRole('textbox', { name: 'Invoice number' }).fill(data.invoiceNumber);
    await this.page.getByRole('textbox', { name: 'Phone number' }).first().fill(data.phone);
    await this.page.getByRole('textbox', { name: 'Email' }).first().fill(data.email);
    await this.page.getByRole('textbox', { name: 'First name' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Last name' }).fill(data.lastName);
    await this.page.getByRole('textbox', { name: 'Company name' }).fill(data.company);
    await this.page.getByRole('textbox', { name: 'Address' }).fill(data.address);
    await this.page.getByRole('textbox', { name: 'Town / city' }).fill(data.city);

    const countryInput = this.page.getByRole('combobox', { name: 'Country' });
    await countryInput.fill(data.countrySearch);

    const countryOption = this.page.getByRole('option', {
      name: data.countryOption,
    });

    await expect(countryOption).toBeVisible({ timeout: 10000 });
    await countryOption.click();
  }

  async fillProductDetails(data: any) {
    await this.page.getByRole('textbox', { name: 'Product / service name' }).fill(data.productName);
    await this.page.getByRole('textbox', { name: 'Description' }).fill(data.description);
    await this.page.getByRole('textbox', { name: 'Expire in (days)' }).fill(data.expiryDays);
    await this.page.getByRole('textbox', { name: 'Expire in (hours)' }).fill(data.expiryHours);
    await this.page.getByRole('textbox', { name: 'Quantity' }).fill(data.quantity);
    await this.page.getByRole('textbox', { name: 'Amount', exact: true }).fill(data.amount);

    const mobileInput = this.page.getByRole('textbox', { name: 'Mobile number' });
    if (await mobileInput.isVisible().catch(() => false)) {
      await mobileInput.fill(data.mobileNumber);
    }

    const messageInput = this.page.getByRole('textbox', { name: 'Message' });
    if (await messageInput.isVisible().catch(() => false)) {
      await messageInput.fill(data.message);
    }
  }

  async continueToReview() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async sendInvoice() {
    const sendEmailButton = this.page.getByRole('button', { name: 'Send Email' });
    await expect(sendEmailButton).toBeVisible({ timeout: 10000 });
    await sendEmailButton.click();

    await expect(
      this.page.getByText(/Invoice created|Invoice generated/i).first()
    ).toBeVisible({ timeout: 15000 });
  }

  async openPaymentPage() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByRole('button', { name: 'Open' }).click();

    const paymentPage = await popupPromise;
    await paymentPage.waitForLoadState('domcontentloaded');

    return paymentPage;
  }
}