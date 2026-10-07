import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import loginData from '../../test-data/merchant/loginData.json';

for (const data of loginData) {

    test(`Merchant Login - ${data.expected}`, async ({ page }) => {

        const loginPage = new LoginPage(page);

        await page.goto('https://sandbox.paycaps.com/crm/login');

        await loginPage.login(
            data.email,
            data.password
        );

        if (data.expected === 'success') {

            await expect(page).toHaveURL(/dashboard/);

        } else {

            await expect(
                page.getByText(/invalid|incorrect|failed/i)
            ).toBeVisible();
        }
    });
}