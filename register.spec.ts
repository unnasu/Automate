import { test, expect } from '@playwright/test';
import { RegisterPage, RegisterMessages, REGISTER_URL, uniqueRegisterData } from '../pages/RegisterPage';

test.describe('Register page', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'skipped') return;

    const testCaseId = testInfo.title.split(' - ')[0];
    const screenshot = await page.screenshot({
      fullPage: true,
      path: `screenshots/${testInfo.project.name}/register-${testCaseId}-${testInfo.status}.png`,
    });
    await testInfo.attach(`${testCaseId} - ${testInfo.status}`, { body: screenshot, contentType: 'image/png' });
  });

  test('TC01 - valid data registers a new account successfully', async ({ page }) => {
    const data = uniqueRegisterData();
    test.info().annotations.push({ type: 'username', description: data.username });

    const response = await registerPage.register(data);
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toHaveProperty('accessToken');

    await expect(registerPage.resultPopup).toBeVisible();
    await expect(registerPage.resultPopup).toContainText(RegisterMessages.successTitle);
    await expect(page).toHaveURL(REGISTER_URL);
  });
});
