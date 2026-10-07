
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {

    readonly page: Page;
    readonly email: Locator;
    readonly password: Locator;
    readonly captcha: Locator;
    readonly signInButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {

        this.page = page;

        this.email = page.getByRole('textbox', {
            name: 'Email Address'
        });

        this.password = page.getByRole('textbox', {
            name: 'Password'
        });

        this.captcha = page.getByRole('textbox', {
            name: 'Captcha'
        });

        this.signInButton = page.getByRole('button', {
            name: 'Sign In'
        });

        this.errorMessage = page.getByText(
            'Invalid email or password'
        );
    }

    // Navigate to Login
    async navigateToLogin() {

        await this.page.goto('/crm/login');

    }

    // Enter Email
    async enterEmail(email: string) {

        await this.email.fill(email);

        await expect(this.email).toHaveValue(email);
    }

    // Enter Password
    async enterPassword(password: string) {

        await this.password.fill(password);

        await expect(this.password).toHaveValue(password);
    }

    // Manual CAPTCHA Handling
    async waitForCaptcha() {

        console.log('Please enter CAPTCHA manually.');

        await this.page.waitForTimeout(10000);

        // Verify CAPTCHA is entered after resuming
        await expect(this.captcha).not.toHaveValue('');

    }

    // Click Sign In
    async clickSignIn() {

        await this.signInButton.click();

    }

    // Verify Login Error
    async verifyLoginError() {

        await expect(this.errorMessage).toBeVisible();

    }

    // Complete Login Flow
    async login(email: string, password: string) {

        await this.navigateToLogin();

        await this.enterEmail(email);

        await this.enterPassword(password);

        await this.waitForCaptcha();

        await this.clickSignIn();

    }
}