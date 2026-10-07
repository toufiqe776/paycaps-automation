import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/common/LoginPage';
import { PayByLinkPage } from '../../pages/admin/PayByLinkPage';
import { PayByLinkPaymentPage } from '../../pages/admin/PayByLinkPaymentPage';

import loginData from '../../test-data/admin/loginData.json';
import payByLinkData from '../../test-data/admin/payByLinkData.json';

for (const login of loginData) {

    for (const data of payByLinkData) {

        test(
            `Pay By Link - ${login.expected}`,
            async ({ page }) => {

                // Login
                const loginPage = new LoginPage(page);

                await page.goto(
                    'https://sandbox.paycaps.com/crm/login'
                );

                await loginPage.login(
                    login.email,
                    login.password
                );

                if (login.expected === 'success') {

                    await expect(page).toHaveURL(/dashboard/);

                    // Pay By Link
                    const payByLinkPage =
                        new PayByLinkPage(page);

                    await payByLinkPage.clickPayByLink();

                    await payByLinkPage.clickCreate();

                    await payByLinkPage.selectMerchant(
                        data.merchant
                    );

                    await payByLinkPage.enterAmount(
                        data.amount
                    );

                    await payByLinkPage.enterCustomerEmail(
                        data.customerEmail
                    );

                    await payByLinkPage.enterCustomerName(
                        data.customerName
                    );

                    await payByLinkPage.enterPhoneNumber(
                        data.phoneNumber
                    );

                    if (data.allowCustomerEditName) {
                        await payByLinkPage
                            .checkAllowCustomerEditName();
                    }

                    await payByLinkPage.enterPurpose(
                        data.purpose
                    );

                    await payByLinkPage.clickContinue();

                    await payByLinkPage.clickGenerateLink();

                    // Popup
                    const popupPromise =
                        page.waitForEvent('popup');

                    await payByLinkPage.clickOpen();

                    const paymentPage =
                        await popupPromise;

                    const payByLinkPaymentPage =
                        new PayByLinkPaymentPage(paymentPage);

                    // Payment
                    await payByLinkPaymentPage.clickPayNow();

                    await payByLinkPaymentPage
                        .enterCardNumber(data.cardNumber);

                    await payByLinkPaymentPage
                        .enterExpiry(data.expiry);

                    await payByLinkPaymentPage
                        .enterCVV(data.cvv);

                    await payByLinkPaymentPage
                        .enterNameOnCard(data.nameOnCard);

                    await payByLinkPaymentPage.clickPay();

                    await payByLinkPaymentPage.enterOTP(
                        data.otp
                    );

                    await payByLinkPaymentPage
                        .clickSimulateSuccess();

                    await payByLinkPaymentPage
                        .verifyCaptured();
                }
            }
        );
    }
}