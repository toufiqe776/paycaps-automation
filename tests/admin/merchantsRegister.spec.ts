import { test } from '@playwright/test';

import { LoginPage } from '../../pages/common/LoginPage';
import { MerchantRegisterPage } from '../../pages/admin/MerchantRegisterPage';

import merchantData from '../../test-data/admin/merchantRegisterData.json';

test.describe('Admin - Merchant Registration', () => {

  test('Merchant registration validation and successful registration', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const merchantRegisterPage = new MerchantRegisterPage(page);

    await test.step('Step 1: Admin Login', async () => {

      await loginPage.login(
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!
      );

    });

    await test.step('Step 2: Open User Registration', async () => {

      await merchantRegisterPage.openUserRegistration();

    });

    await test.step('Step 3: Validate mandatory Business Name', async () => {

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.businessName
      );

    });

    await test.step('Step 4: Enter Business Name and validate Email', async () => {

      await merchantRegisterPage.fillBusinessName(
        merchantData.businessName
      );

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.email
      );

    });

    await test.step('Step 5: Enter Email and validate Phone', async () => {

      await merchantRegisterPage.fillEmail(
        merchantData.email
      );

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.phone
      );

    });

    await test.step('Step 6: Enter Phone and validate Industry', async () => {

      await merchantRegisterPage.fillPhone(
        merchantData.phone
      );

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.industry
      );

    });

    await test.step('Step 7: Select Industry', async () => {

      await merchantRegisterPage.selectIndustry(
        merchantData.industry
      );

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.password
      );

    });

    await test.step('Step 8: Enter Password and validate Confirm Password', async () => {

      await merchantRegisterPage.fillPassword(
        merchantData.password
      );

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyAlert(
        merchantData.expectedMessages.confirmPassword
      );

    });

    await test.step('Step 9: Confirm Password', async () => {

      await merchantRegisterPage.fillConfirmPassword(
        merchantData.password
      );

    });

    await test.step('Step 10: Complete Merchant Registration', async () => {

      await merchantRegisterPage.clickRegisterUser();

      await merchantRegisterPage.verifyMerchantAccountDetails();

    });

  });

});