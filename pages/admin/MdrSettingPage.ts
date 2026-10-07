import { Page, Locator, expect } from '@playwright/test';

export interface MdrRateItem {
    rowLabel?: string;
    rowIndex: number;
    domesticPercent: string;
    internationalPercent: string;
    schemeName?: string;
    expectedPopupMessage: string;
}

export class MdrSettingPage {

    readonly page: Page;

    // Navigation locators
    readonly paymentBillingButton: Locator;
    readonly mdrSettingButton: Locator;
    readonly mdrSettingContainer: Locator;

    // Filter dropdown locators
    readonly selectMerchantDropdown: Locator;
    readonly selectAcquirerDropdown: Locator;

    // Table, alert, and menu locators
    readonly tableRows: Locator;
    readonly successToast: Locator;
    readonly userMenuButton: Locator;
    readonly logoutMenuItem: Locator;

    constructor(page: Page) {

        this.page = page;

        // Navigation
        this.paymentBillingButton = page.getByRole('button', {
            name: 'Payment Billing'
        });

        this.mdrSettingButton = page.getByRole('button', {
            name: 'MDR Setting'
        });

        this.mdrSettingContainer = page.getByTestId('mdr-setting-page');

        // Dropdowns
        this.selectMerchantDropdown = page.getByRole('combobox', {
            name: 'Select Merchant'
        });

        this.selectAcquirerDropdown = page.getByRole('combobox', {
            name: 'Select Acquirer'
        });

        // Target all table rows across Credit and Debit Card tables
        this.tableRows = page.locator('table tbody tr');

        // Toast alert locator (matches screenshot green snackbar)
        this.successToast = page.getByRole('alert')
            .or(page.locator('div[role="status"]'))
            .or(page.locator('div').filter({ hasText: /updated and activated successfully/i })).first();

        this.userMenuButton = page.getByRole('button', {
            name: 'User menu'
        });

        this.logoutMenuItem = page.getByRole('menuitem', {
            name: 'Logout'
        });
    }

    async openMdrSetting() {
        await this.paymentBillingButton.click();
        await this.mdrSettingButton.click();
        await expect(this.mdrSettingContainer).toContainText('MDR Setting');
    }

    async selectMerchantAndAcquirer(merchantSearch: string, merchantName: string, acquirerName: string) {
        // Merchant selection
        await this.selectMerchantDropdown.click();
        await this.selectMerchantDropdown.fill(merchantSearch);

        const merchantOption = this.page.getByRole('option', {
            name: new RegExp(merchantName, 'i')
        }).first();

        await merchantOption.waitFor({ state: 'visible', timeout: 7000 });
        await merchantOption.click();

        // Acquirer selection
        await this.selectAcquirerDropdown.click();

        const acquirerOption = this.page.getByRole('option', {
            name: new RegExp(acquirerName, 'i')
        }).first();

        await acquirerOption.waitFor({ state: 'visible', timeout: 7000 });
        await acquirerOption.click();

        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async updateRateRow(rate: MdrRateItem) {
        const row = this.tableRows.nth(rate.rowIndex);

        // Scroll to the target row so it is visible
        await row.scrollIntoViewIfNeeded();

        // Click Edit button
        const editButton = row.getByRole('button', { name: 'Edit' });
        await editButton.waitFor({ state: 'visible', timeout: 7000 });
        await editButton.click();

        // Enable Checkbox if not already checked
        const checkbox = row.getByRole('checkbox').first();
        if (await checkbox.isVisible()) {
            await checkbox.check();
        }

        // Fill Dom %
        const domInput = row.getByPlaceholder(/Dom/i).first();
        await domInput.waitFor({ state: 'visible', timeout: 5000 });
        await domInput.fill(rate.domesticPercent);

        // Fill Intl %
        const intlInput = row.getByPlaceholder(/Intl/i).first();
        await intlInput.waitFor({ state: 'visible', timeout: 5000 });
        await intlInput.fill(rate.internationalPercent);

        // Click Update
        await row.locator('button').filter({ hasText: 'Update' }).click();
    }

    async verifySuccessPopup(expectedText: string) {
        await expect(this.successToast).toBeVisible({ timeout: 5000 });
        await expect(this.successToast).toContainText(expectedText);

        // Wait a short moment or close toast so it doesn't block the next row click
        const closeToastBtn = this.successToast.locator('button, svg').last();
        if (await closeToastBtn.isVisible().catch(() => false)) {
            await closeToastBtn.click().catch(() => {});
        }
        await this.page.waitForTimeout(500);
    }

    async verifyRowRate(rate: MdrRateItem) {
        const row = this.tableRows.nth(rate.rowIndex);

        await row.scrollIntoViewIfNeeded();
        await expect(row.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10000 });
        await expect(row).toContainText(rate.domesticPercent);
        await expect(row).toContainText(rate.internationalPercent);
    }

    async logout() {
        await this.userMenuButton.click();
        await this.logoutMenuItem.click();
    }
}