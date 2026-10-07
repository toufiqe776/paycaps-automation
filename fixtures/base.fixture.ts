import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/common/LoginPage';

type MyFixtures = {
  loggedInPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    );

    
    await use(loginPage);

    
  },
});

export { expect };