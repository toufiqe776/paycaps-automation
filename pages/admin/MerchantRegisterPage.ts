// pages/admin/MerchantRegisterPage.ts

import { Page, Locator, expect } from '@playwright/test';

export class MerchantRegisterPage {
  readonly page: Page;
  readonly merchantsMenuButton: Locator;
  readonly userRegistrationSubMenu: Locator;
  readonly registerUserButton: Locator;
  readonly alertToast: Locator;
  readonly businessNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly industryDropdown: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.merchantsMenuButton = page.getByRole('button', { name: 'Merchants' });
    this.userRegistrationSubMenu = page.getByRole('button', { name: 'User Registration' });
    this.registerUserButton = page.getByRole('button', { name: /Register User|Submit/i });

    // Multi-element match se bachne ke liye safe alert locator
    this.alertToast = page.locator('[role="alert"], .MuiAlert-message, .Toastify__toast-body');

    this.businessNameInput = page.getByRole('textbox', { name: 'Business Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email Address' });
    this.phoneInput = page.getByRole('textbox', { name: 'Mobile / Phone Number' });
    this.industryDropdown = page.getByTestId('admin-merchant-register-page').getByLabel('Industry Category');
    this.passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password' });
  }

  async openUserRegistration() {
    await this.merchantsMenuButton.click();
    await this.userRegistrationSubMenu.click();
    await expect(this.page.locator('body')).toContainText('User Registration', { timeout: 15000 });
  }

  async clickRegisterUser() {
    await this.registerUserButton.click();
  }

  async fillBusinessName(name: string) {
    await this.businessNameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPhone(phone: string) {
    await this.phoneInput.fill(phone);
  }

  async selectIndustry(industry: string) {
    await this.industryDropdown.click();
    await this.page.getByRole('option', { name: new RegExp(industry, 'i') }).click();
  }

  async fillPassword(pass: string) {
    await this.passwordInput.fill(pass);
  }

  async fillConfirmPassword(pass: string) {
    await this.confirmPasswordInput.fill(pass);
  }

  // Resilient alert assertion: regex use karta hai taaki full-stop (.) ya case-sensitivity issue na bane
  async verifyAlert(expectedMessage: string) {
    // Regex clean string bina strict punctuation
    const cleanPattern = new RegExp(expectedMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\./g, '\\.?'), 'i');
    await expect(this.alertToast.first()).toContainText(cleanPattern, { timeout: 10000 });
  }

  async verifyMerchantAccountDetails() {
    await expect(this.page.locator('body')).toContainText(/Merchant Account Details|Successfully/i, { timeout: 20000 });
  }
}