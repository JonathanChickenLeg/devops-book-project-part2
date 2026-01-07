import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../playwright.config';
const BASE_URL = 'http://localhost:5050';
const USER_FILE = path.join(__dirname, '../utils/users.json');

test.beforeAll(async () => {
  const projects: { name: string }[] = (config as any).projects ?? [];
  const browsers: string[] = projects.map(p => p.name);
  const initialData = browsers.flatMap((browserName: string) => [
  ]);
  await fs.writeFile(USER_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  console.log('users.json initialized for browsers:', browsers.join(', '));
});
test.describe('Add User Frontend Tests', () => {
  test('Create User', async ({ page, browserName }) => {
    await page.goto(BASE_URL);
    const userName = `user-${browserName}`;
    // Open modal
    await page.click('#register-nav');
    // Fill form
    await page.fill('#reg-username', userName);
    await page.fill('#reg-password', 'password123');
    // Submit the new resource
    await page.click('#register-btn');
    // Wait for modal to close
    await page.waitForSelector('#register-section', { state: 'hidden', timeout: 100000 });
    // Fill form
    await page.fill('#lgn-username', userName);
    await page.fill('#lgn-password', 'password123');

    await page.click('#login-btn');
    // Wait for successful login
    await page.waitForSelector('#library-section', { timeout: 100000 });
    // Wait for the new row in the table
    const name = page.locator('#current-user', { hasText: userName });
    await name.waitFor({ state: 'visible', timeout: 10000 });
    // Assert it is visible
    await expect(name).toBeVisible();
  });
});