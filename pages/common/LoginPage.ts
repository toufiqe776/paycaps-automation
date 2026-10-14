import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly captchaInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /Email Address|Email/i });
    this.passwordInput = page.getByRole('textbox', { name: /Password/i });
    this.captchaInput = page.getByRole('textbox', { name: /Captcha/i });
    this.signInButton = page.getByRole('button', { name: /Sign In|Login/i });
  }

  async navigateToLogin() {
    await this.page.goto('/crm/login');
    await expect(this.emailInput).toBeVisible({ timeout: 15000 });
  }

  async enterCredentials(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
  }

  async handleCaptcha(captchaValue?: string) {
    if (await this.captchaInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const code = captchaValue || process.env.CAPTCHA_CODE || '1234';
      await this.captchaInput.fill(code);
    }
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, pass: string, captchaValue?: string) {
    await this.navigateToLogin();
    await this.enterCredentials(email, pass);
    await this.handleCaptcha(captchaValue);
    await this.clickSignIn();
  }
}