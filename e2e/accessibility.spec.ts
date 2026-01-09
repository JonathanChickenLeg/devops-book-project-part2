import './playwright-coverage.js';
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5050';

function hasRole(node: any, role: string): boolean {
  if (!node) return false;
  if (node.role === role) return true;
  const children = node.children || [];
  for (const child of children) {
    if (hasRole(child, role)) return true;
  }
  return false;
}

test.describe('Accessibility Checks', () => {
  test('Home page has main landmark and navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('Register modal exposes form controls', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('#register-nav');
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('button').first()).toBeVisible();
  });
});
