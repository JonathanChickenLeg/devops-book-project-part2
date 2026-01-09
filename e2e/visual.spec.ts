import './playwright-coverage.js';
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5050';

// Visual regression using Playwright's built-in screenshot matcher
// First run creates baselines; subsequent runs compare against them.
test.describe('Visual Regression', () => {
  test('Homepage baseline', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
  });

  test('Register modal visual state', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('#register-nav');
    await expect(page).toHaveScreenshot('register-modal.png');
  });
});
