import { test, expect } from '@playwright/test';
import { LoginPage, LoginMessages, LOGIN_URL } from '../pages/LoginPage';

const VALID_USERNAME = process.env.LOGIN_USERNAME;
const VALID_PASSWORD = process.env.LOGIN_PASSWORD;

test.describe('Login page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'skipped') return;

    const testCaseId = testInfo.title.split(' - ')[0];
    const screenshot = await page.screenshot({
      fullPage: true,
      path: `screenshots/${testInfo.project.name}/${testCaseId}-${testInfo.status}.png`,
    });
    await testInfo.attach(`${testCaseId} - ${testInfo.status}`, { body: screenshot, contentType: 'image/png' });
  });

  test('TC01 - shows the login form', async () => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', LoginMessages.usernamePlaceholder);
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', LoginMessages.passwordPlaceholder);
    await expect(loginPage.submitButton).toHaveText(LoginMessages.submitButton);
    await expect(loginPage.registerLink).toHaveText(LoginMessages.registerLink);
  });

  test('TC02 - password field is masked', async () => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC03 - submitting an empty form shows required errors for both fields', async ({ page }) => {
    await loginPage.submit();

    await expect(loginPage.usernameRequiredError).toBeVisible();
    await expect(loginPage.passwordRequiredError).toBeVisible();
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('TC04 - submitting without a password shows a password error', async () => {
    await loginPage.fillUsername('someuser');
    await loginPage.submit();

    await expect(loginPage.passwordRequiredError).toBeVisible();
    await expect(loginPage.usernameRequiredError).toBeHidden();
  });

  test('TC05 - submitting without a username shows a username error', async () => {
    await loginPage.fillPassword('SomePass123');
    await loginPage.submit();

    await expect(loginPage.usernameRequiredError).toBeVisible();
    await expect(loginPage.passwordRequiredError).toBeHidden();
  });

  test('TC06 - wrong credentials show an error popup and stay on the login page', async ({ page }) => {
    const response = await loginPage.login(`wronguser_${Date.now()}`, 'WrongPass123');
    expect(response.status()).toBe(400);

    await expect(loginPage.errorPopup).toBeVisible();
    await expect(loginPage.errorPopup).toContainText(LoginMessages.errorTitle);
    await expect(loginPage.errorPopup).toContainText(LoginMessages.invalidCredentials);

    await loginPage.closeErrorPopup();
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('TC07 - register link goes to the register page', async ({ page }) => {
    await loginPage.goToRegister();
    await expect(page).toHaveURL(/\/th\/register/);
  });

  test('TC08 - valid credentials log in successfully', async ({ page }) => {
    test.skip(!VALID_USERNAME || !VALID_PASSWORD, 'Set LOGIN_USERNAME and LOGIN_PASSWORD to run this test');

    const response = await loginPage.login(VALID_USERNAME!, VALID_PASSWORD!);
    expect(response.ok()).toBeTruthy();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(loginPage.errorPopup).toBeHidden();
  });
});
