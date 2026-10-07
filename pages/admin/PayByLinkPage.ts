import { Page, Locator } from '@playwright/test';

export class PayByLinkPage {

    readonly page: Page;

    readonly payByLinkButton: Locator;
    readonly createButton: Locator;
    readonly merchant: Locator;
    readonly amount: Locator;
    readonly customerEmail: Locator;
    readonly customerName: Locator;
    readonly phoneNumber: Locator;
    readonly purpose: Locator;
    readonly continueButton: Locator;
    readonly generateLinkButton: Locator;
    readonly openButton: Locator;

    constructor(page: Page) {

        this.page = page;

        this.payByLinkButton = page.getByRole('button', {
            name: 'Pay By Link'
        });

        this.createButton = page.getByRole('button', {
            name: 'Create'
        });

        this.merchant = page.getByRole('combobox', {
            name: 'Merchant'
        });

        this.amount = page.getByRole('textbox', {
            name: 'Amount'
        });

        this.customerEmail = page.getByRole('textbox', {
            name: 'Customer Email'
        });

        this.customerName = page.getByRole('textbox', {
            name: 'Customer Name'
        });

        this.phoneNumber = page.getByRole('textbox', {
            name: 'Phone Number'
        });

        this.purpose = page.getByRole('textbox', {
            name: 'Purpose (0/100)'
        });

        this.continueButton = page.getByRole('button', {
            name: 'Continue'
        });

        this.generateLinkButton = page.getByRole('button', {
            name: 'Generate link'
        });

        this.openButton = page.getByRole('button', {
            name: 'Open'
        });
    }

    // Navigate to Pay By Link
    async openPayByLink() {

        await this.payByLinkButton.click();

        await this.createButton.click();
    }

    // Select merchant
    async selectMerchant(
        merchantSearch: string,
        merchantOption: string
    ) {

        await this.merchant.fill(merchantSearch);

        await this.page.getByRole('option', {
            name: merchantOption
        }).click();
    }

    // Enter payment information
    async enterPaymentDetails(data: any) {

        await this.amount.fill(data.amount);

        await this.customerEmail.fill(data.customerEmail);

        await this.customerEmail.press('Tab');

        await this.customerName.fill(data.customerName);

        await this.phoneNumber.fill(data.phoneNumber);

        await this.purpose.fill(data.purpose);
    }

    // Generate payment link
    async generatePaymentLink(data: any) {

        await this.selectMerchant(
            data.merchantSearch,
            data.merchantOption
        );

        await this.enterPaymentDetails(data);

        await this.continueButton.click();

        await this.generateLinkButton.click();
    }

    // Open payment page in new tab
    async openPaymentPage(): Promise<Page> {

        const popupPromise = this.page.waitForEvent('popup');

        await this.openButton.click();

        const paymentPage = await popupPromise;

        await paymentPage.waitForLoadState();

        return paymentPage;
    }
}