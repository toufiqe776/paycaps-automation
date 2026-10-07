import { Page, Locator, expect } from '@playwright/test';

export class AcquirerRoutingPage {

    readonly page: Page;

    // Navigation
    readonly paymentBillingButton: Locator;
    readonly acquirerRoutingButton: Locator;
    readonly addNewRouteButton: Locator;

    // Form fields
    readonly merchantDropdown: Locator;
    readonly acquirerDropdownContainer: Locator;
    readonly paymentMethodContainer: Locator;
    readonly transactionTypeDropdown: Locator;
    readonly currencyDropdownContainer: Locator;
    readonly currencyInput: Locator;
    readonly authTypeDropdown: Locator;
    readonly merchantIdInput: Locator;
    readonly apiKeyInput: Locator;
    readonly txnKeyInput: Locator;
    readonly passwordInput: Locator;
    readonly saveAcquirerRouteButton: Locator;

    // Table filters
    readonly filterMerchant: Locator;
    readonly filterAcquirerContainer: Locator;
    readonly dataTableBody: Locator;

    constructor(page: Page) {

        this.page = page;

        // Navigation
        this.paymentBillingButton = page.getByRole('button', {
            name: 'Payment Billing'
        });

        this.acquirerRoutingButton = page.getByRole('button', {
            name: 'Acquirer Routing'
        });

        this.addNewRouteButton = page.getByRole('button', {
            name: 'Add New Route'
        });

        // Form fields
        this.merchantDropdown = page.getByRole('combobox', {
            name: 'Merchant *'
        });

        this.acquirerDropdownContainer = page.locator('div').filter({
            hasText: /^Acquirer \*$/
        });

        this.paymentMethodContainer = page.locator('div').filter({
            hasText: /^Payment Method \*$/
        });

        this.transactionTypeDropdown = page.getByRole('combobox', {
            name: 'Transaction Type *'
        });

        this.currencyDropdownContainer = page.locator('div').filter({
            hasText: /^Currency \*$/
        });

        this.currencyInput = page.getByRole('combobox', {
            name: 'Currency *'
        });

        this.authTypeDropdown = page.getByRole('combobox', {
            name: 'Authentication Type'
        });

        this.merchantIdInput = page.getByRole('textbox', {
            name: 'Merchant id'
        });

        this.apiKeyInput = page.getByRole('textbox', {
            name: 'Api key'
        });

        this.txnKeyInput = page.getByRole('textbox', {
            name: 'Txn key'
        });

        this.passwordInput = page.getByRole('textbox', {
            name: 'Password'
        });

        this.saveAcquirerRouteButton = page.getByRole('button', {
            name: 'Save Acquirer Route'
        });

        // Table filters
        this.filterMerchant = page.getByRole('combobox', {
            name: 'Merchant'
        });

        this.filterAcquirerContainer = page.locator('div').filter({
            hasText: /^Acquirer$/
        });

        this.dataTableBody = page.getByRole('table', {
            name: 'data table'
        }).locator('tbody');
    }

    async openAcquirerRouting() {
        await this.paymentBillingButton.click();
        await this.acquirerRoutingButton.click();
        await expect(this.addNewRouteButton).toBeVisible();
    }

    async selectMerchant(merchantName: string) {
        await this.merchantDropdown.click();
        await this.merchantDropdown.fill(merchantName);
        const option = this.page.getByRole('option', {
            name: new RegExp(merchantName, 'i')
        }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
    }

    async selectAcquirer(acquirerName: string) {
        await this.acquirerDropdownContainer.click();
        const option = this.page.getByRole('option', {
            name: new RegExp(acquirerName, 'i')
        }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
    }

    async selectPaymentMethod(paymentMethod: string) {
        await this.paymentMethodContainer.click();
        await this.page.getByRole('option', {
            name: paymentMethod,
            exact: true
        }).click();
    }

    async selectCurrency(currencyCode: string) {
        await this.currencyDropdownContainer.click();
        await this.currencyInput.fill(currencyCode);
        const option = this.page.getByRole('option', {
            name: new RegExp(currencyCode, 'i')
        }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
    }

    async fillCredentials(data: any) {
        if (data.merchantId) {
            await this.merchantIdInput.fill(data.merchantId);
        }
        await this.apiKeyInput.fill(data.apiKey);
        await this.txnKeyInput.fill(data.txnKey);
        await this.passwordInput.fill(data.password);
    }

    async createRoute(data: any) {
        await this.addNewRouteButton.click();

        await this.selectMerchant(data.merchant);
        await this.selectAcquirer(data.acquirer);
        await this.selectPaymentMethod(data.paymentMethod);

        if (data.transactionType) {
            await this.transactionTypeDropdown.click();
            await this.page.getByRole('option', {
                name: new RegExp(data.transactionType, 'i')
            }).first().click();
        }

        await this.selectCurrency(data.currency);

        if (data.authenticationType) {
            await this.authTypeDropdown.click();
            await this.page.getByRole('option', {
                name: new RegExp(data.authenticationType, 'i')
            }).first().click();
        }

        await this.fillCredentials(data);
        await this.saveAcquirerRouteButton.click();

        // Modal band hone ka wait karein agla route add karne se pehle
        await expect(this.addNewRouteButton).toBeVisible();
        await this.page.waitForTimeout(500);
    }

    async filterAndVerifyTable(merchant: string, acquirer: string, expectedRows: string[]) {
        // Modal / background animation settle hone ka wait
        await this.page.waitForLoadState('networkidle').catch(() => {});

        // 1. Merchant filter
        await this.filterMerchant.click();
        await this.filterMerchant.fill(merchant);
        const merchantOption = this.page.getByRole('option', {
            name: new RegExp(merchant, 'i')
        }).first();
        await merchantOption.waitFor({ state: 'visible', timeout: 5000 });
        await merchantOption.click();

        // 2. Acquirer filter
        await this.filterAcquirerContainer.click();
        const acquirerOption = this.page.getByRole('option', {
            name: new RegExp(acquirer, 'i')
        }).first();
        await acquirerOption.waitFor({ state: 'visible', timeout: 5000 });
        await acquirerOption.click();

        // 3. Grid load wait
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.dataTableBody.locator('tr').first().waitFor({
            state: 'visible',
            timeout: 10000
        });

        // 4. Assert table text
        for (const value of expectedRows) {
            await expect(this.dataTableBody).toContainText(value, { timeout: 10000 });
        }
    }
}