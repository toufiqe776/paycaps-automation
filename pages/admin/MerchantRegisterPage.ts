import { expect, Page } from '@playwright/test';

export class MerchantRegisterPage {
  constructor(private page: Page) {}

  // Navigation

  async openUserRegistration() {
    await this.page.getByRole('button', { name: 'Merchants' }).click();
    await this.page.getByRole('button', { name: 'User Registration' }).click();

    await expect(
      this.page.getByRole('heading')
    ).toContainText('User Registration');
  }

  // Common actions

  async clickRegisterUser() {
    await this.page.getByRole('button', {
      name: 'Register User'
    }).click();
  }

  async getAlertMessage() {
    return await this.page.getByRole('alert').textContent();
  }

  async verifyAlert(expectedMessage: string) {
    await expect(
      this.page.getByRole('alert')
    ).toContainText(expectedMessage);
  }

  // Form fields

  async fillBusinessName(businessName: string) {
    await this.page.getByRole('textbox', {
      name: 'Business Name'
    }).fill(businessName);
  }

  async fillEmail(email: string) {
    await this.page.getByRole('textbox', {
      name: 'Email Address'
    }).fill(email);
  }

  async fillPhone(phone: string) {
    await this.page.getByRole('textbox', {
      name: 'Mobile / Phone Number'
    }).fill(phone);
  }

  async selectIndustry(industry: string) {
    await this.page
      .getByTestId('admin-merchant-register-page')
      .getByLabel('Industry Category')
      .click();

    await this.page.getByRole('option', {
      name: industry
    }).click();
  }

  async fillPassword(password: string) {
    await this.page.getByRole('textbox', {
      name: 'Password',
      exact: true
    }).fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.page.getByRole('textbox', {
      name: 'Confirm Password'
    }).fill(password);
  }

  async verifyMerchantAccountDetails() {
    await expect(
      this.page.getByRole('heading')
    ).toContainText('Merchant Account Details');
  }
}