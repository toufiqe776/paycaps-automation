// tests/admin/mdrSetting.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { MdrSettingPage } from '../../pages/admin/MdrSettingPage';
import { StateHelper } from '../../utils/stateHelper';
import mdrScenarios from '../../test-data/admin/mdrSettingData.json';

test.describe('Admin - MDR Settings Configuration', () => {
  for (const scenario of mdrScenarios) {
    test(`[${scenario.scenarioId}] ${scenario.scenarioName}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const mdrSettingPage = new MdrSettingPage(page);

      // Dynamic merchant preference, scenario JSON as fallback
      const activeMerchant = StateHelper.getCreatedMerchant() || scenario.merchantName;
      const searchKeyword = activeMerchant.slice(0, 5);

      await test.step('Step 1: Admin Login', async () => {
        await loginPage.login(
          process.env.ADMIN_EMAIL || 'qaadmin@yopmail.com',
          process.env.ADMIN_PASSWORD || 'Admin@123'
        );
      });

      await test.step('Step 2: Open MDR Setting Page', async () => {
        await mdrSettingPage.openMdrSetting();
      });

      await test.step(`Step 3: Filter Merchant [${activeMerchant}] & Acquirer [${scenario.acquirerName}]`, async () => {
        await mdrSettingPage.selectMerchantAndAcquirer(
          searchKeyword,
          activeMerchant,
          scenario.acquirerName
        );
      });

      // Har run par unique rate delta (e.g. +0.10 se +0.60)
      const randomOffset = (Math.floor(Math.random() * 50) + 10) / 100;

      for (const rate of scenario.rates) {
        const dynamicDom = (parseFloat(rate.domesticPercent) + randomOffset).toFixed(2);
        const dynamicIntl = (parseFloat(rate.internationalPercent) + randomOffset).toFixed(2);

        const payload = {
          ...rate,
          domesticPercent: dynamicDom,
          internationalPercent: dynamicIntl,
        };

        const label = rate.rowLabel || `Row ${rate.rowIndex}`;

        await test.step(`Step 4: Update Rate for ${label} [Dom: ${dynamicDom}%, Intl: ${dynamicIntl}%]`, async () => {
          await mdrSettingPage.updateRateRow(payload);
        });

        await test.step(`Step 5: Verify Toast Alert for ${label}`, async () => {
          await mdrSettingPage.verifySuccessPopup(rate.expectedPopupMessage);
        });

        await test.step(`Step 6: Verify Grid Persisted Value for ${label}`, async () => {
          await mdrSettingPage.verifyRowRate(payload);
        });
      }

      await test.step('Step 7: Admin Logout', async () => {
        await mdrSettingPage.logout();
      });
    });
  }
});