import { Page, Locator, expect } from '@playwright/test';

export class PayByLinkPaymentPage {

    readonly page: Page;

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

        this.payNowButton = page.getByRole('button', {
            name: 'PAY NOW'
        });

        this.cardNumber = page.getByRole('textbox', {
            name: 'XXXX - XXXX - XXXX - XXXX'
        });

        this.expiryDate = page.getByRole('textbox', {
            name: 'MM/YY'
        });

        this.cvv = page.getByRole('textbox', {
            name: 'CVV'
        });

        this.cardHolderName = page.getByRole('textbox', {
            name: 'Name on Card'
        });

        this.payButton = page.getByRole('button', {
            name: 'Pay AED'
        });

        this.otp = page.locator('#otp');

        this.simulateSuccessButton = page.getByRole('button', {
            name: 'Simulate Success'
        });
    }

    async clickPayNow() {

        await this.payNowButton.click();
    }

    async enterCardDetails(data: any) {

        await this.cardNumber.fill(data.cardNumber);

        await this.expiryDate.fill(data.expiryDate);

        await this.cvv.fill(data.cvv);

        await this.cardHolderName.fill(data.cardHolderName);
    }

    async submitPayment() {

        await this.payButton.click();
    }

    async enterOTP(otp: string) {

        await this.otp.fill(otp);
    }

    async simulateSuccess() {

        await this.simulateSuccessButton.click();
    }

    async verifyPaymentStatus(expectedStatus: string) {

        await expect(this.page.locator('body'))
            .toContainText(expectedStatus);
    }
}