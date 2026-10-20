import { Page, Locator, expect } from '@playwright/test';

export class MerchantListPage {
  readonly page: Page;

  // Navigation
  readonly merchantsMenuButton: Locator;
  readonly merchantListSubMenuButton: Locator;

  // Search & Filter
  readonly filtersButton: Locator;
  readonly searchInput: Locator;
  readonly applyFilterButton: Locator;

  // Switches & Actions
  readonly payByLinkSwitch: Locator;
  readonly merchantHostedPageSwitch: Locator;
  readonly s2sSwitch: Locator;
  readonly saveButton: Locator;

  // User menu
  readonly userMenuButton: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.merchantsMenuButton = page.getByRole('button', { name: 'Merchants' });
    this.merchantListSubMenuButton = page.getByRole('button', { name: 'Merchant List' });

    // Filter
    this.filtersButton = page.getByRole('button', { name: 'Filters' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.applyFilterButton = page.getByRole('button', { name: 'Apply' });

    // Switches & Save
    this.payByLinkSwitch = page.getByRole('switch', { name: 'Pay By Link' });
    this.merchantHostedPageSwitch = page.getByRole('switch', { name: 'Merchant Hosted Page' });
    this.s2sSwitch = page.getByRole('switch', { name: 'S2S' });
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();

    // User menu
    this.userMenuButton = page.getByRole('button', { name: 'User menu' });
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
  }

  async navigateToMerchantList() {
    await this.merchantsMenuButton.click();
    await this.merchantListSubMenuButton.click();
    await expect(this.filtersButton).toBeVisible({ timeout: 15000 });
  }

  async filterByMerchant(merchantName: string) {
    await this.filtersButton.click();
    await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.searchInput.fill('');
    await this.searchInput.pressSequentially(merchantName, { delay: 50 });
    await this.applyFilterButton.click();

    // Table load hone aur row filter hone ka wait
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  async activateMerchantAndConfigureServices() {
    // 1. Filtered row ke andar specific 'Setup' button target karein
    const merchantRow = this.page.locator('table tbody tr', { hasText: 'Setup' }).first();
    const setupBtn = merchantRow.getByRole('button', { name: 'Setup' });

    await expect(setupBtn).toBeVisible({ timeout: 15000 });
    await setupBtn.click();

    // 2. Business Details tab / dialog element mount hone ka wait
    const businessTab = this.page
      .getByRole('tab', { name: 'Business Details' })
      .or(this.page.getByRole('button', { name: 'Business Details' }))
      .or(this.page.locator('text=Business Details'))
      .first();

    await businessTab.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});

    // 3. Status change: Pending -> Active (agar modal/drawer me status visible hai)
    const statusDropdown = this.page
      .getByRole('combobox')
      .filter({ hasText: /Pending|Active/i })
      .first();

    if (await statusDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusDropdown.click();
      const activeOption = this.page.getByRole('option', { name: 'Active' }).first();
      await activeOption.click({ timeout: 3000 }).catch(() => {});
    }

    // 4. Business Details tab open karein
    await expect(businessTab).toBeVisible({ timeout: 15000 });
    await businessTab.click();

    // 5. Switches toggle karein
    const switches = [this.payByLinkSwitch, this.merchantHostedPageSwitch, this.s2sSwitch];
    for (const toggle of switches) {
      await toggle.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const isChecked = await toggle.isChecked().catch(() => false);
      if (!isChecked) {
        await toggle.check({ force: true }).catch(async () => {
          await toggle.click({ force: true });
        });
      }
    }

    // 6. Save karein aur success toast verify karein
    await this.saveButton.click();
    const successToast = this.page
      .getByRole('alert')
      .or(this.page.getByText(/updated successfully/i));

    await expect(successToast.first()).toBeVisible({ timeout: 12000 });
    await this.page.waitForTimeout(500);
  }

  async logout() {
    await this.userMenuButton.click();
    await expect(this.logoutMenuItem).toBeVisible({ timeout: 5000 });
    await this.logoutMenuItem.click();
    await expect(this.page).toHaveURL(/.*login/);
  }
}