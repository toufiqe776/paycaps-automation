import { Page, Locator, expect } from '@playwright/test';

export class TransactionsPage {

    readonly page: Page;

    // Navigation & header
    readonly transactionsButton: Locator;
    readonly userMenuButton: Locator;
    readonly logoutMenuItem: Locator;

    // Filters modal
    readonly filtersButton: Locator;
    readonly orderIdFilterInput: Locator;
    readonly applyFilterButton: Locator;

    // Table elements
    readonly tableBody: Locator;
    readonly tableRows: Locator;

    constructor(page: Page) {

        this.page = page;

        // Navigation
        this.transactionsButton = page.getByRole('button', {
            name: 'Transactions'
        });

        this.userMenuButton = page.getByRole('button', {
            name: 'User menu'
        });

        this.logoutMenuItem = page.getByRole('menuitem', {
            name: 'Logout'
        });

        // Filters modal
        this.filtersButton = page.getByRole('button', {
            name: 'Filters'
        });

        this.orderIdFilterInput = page.getByRole('textbox', {
            name: 'Order ID'
        });

        this.applyFilterButton = page.getByRole('button', {
            name: 'Apply'
        });

        // Table
        this.tableBody = page.locator('tbody');
        this.tableRows = page.locator('tbody tr');
    }

    // Open Transactions page
    async openTransactions() {

        await this.transactionsButton.click();

        await expect(
            this.page.getByRole('heading', { name: 'Transactions' })
        ).toBeVisible();
    }

    // Filter past transaction by Order ID
    async filterByOrderId(orderId: string) {

        await this.filtersButton.click();

        await this.orderIdFilterInput.fill(orderId);

        await this.applyFilterButton.click();

        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Verify row details
    async verifyTransaction(data: any) {

        const targetRow = this.tableRows.filter({
            hasText: data.orderId
        });

        await expect(targetRow).toBeVisible();

        await expect(targetRow).toContainText(data.transactionId);
        await expect(targetRow).toContainText(data.transactionDate);
        await expect(targetRow).toContainText(data.orderId);
        await expect(targetRow).toContainText(data.paymentMethod);
        await expect(targetRow).toContainText(data.transactionType);
        await expect(targetRow).toContainText(data.status);
        await expect(targetRow).toContainText(data.currency);
        await expect(targetRow).toContainText(data.amount);
    }

    // Logout
    async logout() {

        await this.userMenuButton.click();

        await this.logoutMenuItem.click();
    }
}