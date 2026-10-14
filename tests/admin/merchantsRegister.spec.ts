// tests/admin/merchantsRegister.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { MerchantRegisterPage } from '../../pages/admin/MerchantRegisterPage';
import { TestDataGenerator } from '../../utils/testDataHelper';
import { StateHelper } from '../../utils/stateHelper';
import merchantData from '../../test-data/admin/merchantRegisterData.json';

test.describe('Admin - Merchant Registration Validation & Dynamic E2E', () => {

  test('Full field validations and dynamic merchant creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const merchantRegisterPage = new MerchantRegisterPage(page);

    // Dynamic unique dataset
    const dynamicData = TestDataGenerator.getMerchantRegisterData({
      industry: merchantData.industry,
      password: merchantData.password,
    });

    await test.step('Step 1: Admin Login', async () => {
      await loginPage.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    });

    await test.step('Step 2: Open User Registration Page', async () => {
      await merchantRegisterPage.openUserRegistration();
    });

    await test.step('Step 3: Validate Mandatory Business Name', async () => {
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.businessName);
    });

    await test.step('Step 4: Enter Business Name & Validate Email', async () => {
      await merchantRegisterPage.fillBusinessName(dynamicData.merchantName);
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.email);
    });

    await test.step('Step 5: Enter Email & Validate Phone Requirement', async () => {
      await merchantRegisterPage.fillEmail(dynamicData.businessEmail);
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.phone);
    });

    await test.step('Step 6: Validate Phone Length Rule (10 to 15 digits)', async () => {
      // 6a: Under 10 digits
      await merchantRegisterPage.fillPhone(merchantData.invalidPhoneNumbers.lessThan10);
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.phone);

      // 6b: Over 15 digits
      await merchantRegisterPage.fillPhone(merchantData.invalidPhoneNumbers.moreThan15);
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.phone);

      // 6c: Valid dynamic 10-digit number
      await merchantRegisterPage.fillPhone(dynamicData.contactNumber);
    });

    await test.step('Step 7: Validate Mandatory Industry Category', async () => {
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.industry);
    });

    await test.step('Step 8: Select Industry & Validate Password Complexity', async () => {
      await merchantRegisterPage.selectIndustry(dynamicData.industry);

      // 8a: Password without special character
      await merchantRegisterPage.fillPassword(merchantData.invalidPassword);
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.password);

      // 8b: Valid complex password
      await merchantRegisterPage.fillPassword(dynamicData.password);
    });

    await test.step('Step 9: Validate Password Mismatch', async () => {
      await merchantRegisterPage.fillConfirmPassword('Mismatch@9999');
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyAlert(merchantData.expectedMessages.confirmPassword);
    });

    await test.step('Step 10: Match Confirm Password', async () => {
      await merchantRegisterPage.fillConfirmPassword(dynamicData.password);
    });

    await test.step('Step 11: Complete Registration & Save State', async () => {
      await merchantRegisterPage.clickRegisterUser();
      await merchantRegisterPage.verifyMerchantAccountDetails();

      // DYNAMIC MERCHANT SAVE FOR NEXT ROUTING STEP
      StateHelper.saveCreatedMerchant(dynamicData.merchantName);
      console.log(`Saved Merchant for Routing: ${dynamicData.merchantName}`);
    });
  });
});