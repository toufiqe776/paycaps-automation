import { test } from '@playwright/test';
import { LoginPage } from '../../pages/common/LoginPage';
import { MdrSettingPage } from '../../pages/admin/MdrSettingPage';

import mdrScenarios from '../../test-data/admin/mdrSettingData.json';

test.describe('Admin - Data-Driven MDR Setting Testing', () => {

    let loginPage: LoginPage;
    let mdrSettingPage: MdrSettingPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        mdrSettingPage = new MdrSettingPage(page);

        await test.step('Step 1: Admin Login', async () => {
            await loginPage.login(
                process.env.ADMIN_EMAIL!,
                process.env.ADMIN_PASSWORD!
            );
        });

        await test.step('Step 2: Navigate to MDR Setting Page', async () => {
            await mdrSettingPage.openMdrSetting();
        });
    });

    mdrScenarios.forEach((scenario) => {
        test(`[${scenario.scenarioId}] ${scenario.scenarioName}`, async () => {

            await test.step(`Step 3: Filter Merchant "${scenario.merchantName}" and Acquirer "${scenario.acquirerName}"`, async () => {
                await mdrSettingPage.selectMerchantAndAcquirer(
                    scenario.merchantSearch,
                    scenario.merchantName,
                    scenario.acquirerName
                );
            });

            await test.step('Step 4: Update and Validate Rates from Dataset', async () => {
                for (const rate of scenario.rates) {
                    
                    await test.step(`Update row: ${rate.rowLabel || rate.rowIndex}`, async () => {
                        await mdrSettingPage.updateRateRow(rate);
                    });

                    // Validate the popup message using the value defined in JSON
                    await test.step(`Validate popup message from JSON for: ${rate.rowLabel || rate.rowIndex}`, async () => {
                        await mdrSettingPage.verifySuccessPopup(rate.expectedPopupMessage);
                    });

                    await test.step(`Validate grid persisted data for: ${rate.rowLabel || rate.rowIndex}`, async () => {
                        await mdrSettingPage.verifyRowRate(rate);
                    });
                }
            });

            await test.step('Step 5: Admin Logout', async () => {
                await mdrSettingPage.logout();
            });
        });
    });
});