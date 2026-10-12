import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import loginData from '../../test-data/admin/loginData.json';

test.describe('Admin Login Data-Driven Suite', () => {
  for (const data of loginData) {
   
    test(`${data.id || 'TC'} - ${data.description || data.expected}`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await page.goto('https://sandbox.paycaps.com/crm/login');

      
      await loginPage.login(
        data.email,
        data.password,
        data.captcha
      );

      if (data.expected === 'success') {
        await expect(page).toHaveURL(/.*dashboard.*/i, { timeout: 15000 });
      } else if (data.expectedMessage) {
        
        await expect(page.getByText(data.expectedMessage)).toBeVisible();
      } else {
        // Fallback generic error assertion
        await expect(
          page.getByText(/invalid|incorrect|failed|required/i).first()
        ).toBeVisible();
      }
    });
  }
});