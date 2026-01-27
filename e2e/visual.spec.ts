import './playwright-coverage.js';
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5050';

test.describe('Visual Regression', () => {
  test('Register modal visual state', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('#register-nav');
    await expect(page).toHaveScreenshot('register-modal.png');
  });
});
