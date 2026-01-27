import './playwright-coverage.js'
import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
const BASE_URL = 'http://localhost:5050';
const USER_FILE = path.join(__dirname, '../utils/users.json');

test.beforeAll(async () => {
  // Avoid importing TS config for speed; mirror current project names
  const browsers: string[] = ['chromium', 'firefox', 'webkit'];
  // Initialize with expected object shape to prevent extra conversions
  await fs.writeFile(USER_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8');
  console.log('users.json initialized for browsers:', browsers.join(', '));
});
test.describe('Add User Frontend Tests', () => {
  test('Successful Registration', async ({ page, browserName }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
    const userName = `user-${browserName}`;
    // Open modal
    await page.click('#register-nav');
    // Fill form
    await page.fill('#reg-username', userName);
    await page.fill('#reg-password', 'password123');
    // Ensure clean state for duplicate check
    await page.route('**/retrieve-users', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [] }) });
    });
    // Submit the new resource
    await page.click('#register-btn');
    // Wait for modal to close
    await page.waitForSelector('#register-section', { state: 'hidden', timeout: 10000 });
    // Prepare login: return the just-created user
    await page.unroute('**/retrieve-users');
    await page.route('**/retrieve-users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: [{ username: userName, password: 'password123', role: 'user' }] })
      });
    });
    // Fill form
    await page.fill('#lgn-username', userName);
    await page.fill('#lgn-password', 'password123');

    await page.click('#login-btn');
    // Wait for successful login
    await expect(page.locator('#library-section')).toBeVisible({ timeout: 10000 });
    // Wait for the new row in the table
    const name = page.locator('#current-user', { hasText: userName });
    await name.waitFor({ state: 'visible', timeout: 10000 });
    // Assert it is visible
    await expect(name).toBeVisible();
  });

  test('Missing username shows alert', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
    await page.click('#register-nav');
    await expect(page.locator('#register-section')).toBeVisible();
    await page.fill('#reg-username', '');
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Enter a username');
      await dialog.accept();
    });
    await page.click('#register-btn');
  });

  test('Missing password shows alert', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
    await page.click('#register-nav');
    await expect(page.locator('#register-section')).toBeVisible();
    await page.fill('#reg-username', 'someone');
    await page.fill('#reg-password', '');
    page.once('dialog', async dialog => {
      expect(dialog.message()).toBe('Enter a password');
      await dialog.accept();
    });
    await page.click('#register-btn');
  });

  test('Duplicate username shows alert', async ({ page }) => {
    await page.route('**/retrieve-users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: [{ username: 'dup', password: 'pw', role: 'user' }] })
      });
    });
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
    await page.click('#register-nav');
    await page.fill('#reg-username', 'dup');
    await page.fill('#reg-password', 'pw');
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.click('#register-btn')
    ]);
    expect(dialog.message()).toContain('Username already taken');
    await dialog.accept();
    await page.unroute('**/retrieve-users');
  });

  test('Backend 500 surfaces error message', async ({ page }) => {
    await page.route('**/retrieve-users', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [] }) }));
    await page.route('**/add-user', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Failed to create user' }) }));
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
    await page.click('#register-nav');
    await page.fill('#reg-username', 'e2e-backend-error');
    await page.fill('#reg-password', 'pw');
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.click('#register-btn')
    ]);
    expect(dialog.message()).toContain('Failed to create user');
    await dialog.accept();
    await page.unroute('**/retrieve-users');
    await page.unroute('**/add-user');
  });
});
// Ensure users.json is restored to an empty users array after tests
test.afterAll(async () => {
  await fs.writeFile(USER_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8');
});