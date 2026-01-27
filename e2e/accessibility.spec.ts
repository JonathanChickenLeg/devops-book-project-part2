import './playwright-coverage.js';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'http://localhost:5050';

test.describe('Accessibility Checks', () => {
    test('Automated accessibility scan (wcag2a, wcag2aa)', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('load');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#register-nav', { state: 'visible', timeout: 20000 });
        await page.click('#register-nav');
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();
        const nonContrastViolations = results.violations.filter(v => v.id !== 'color-contrast');
        if (results.violations.length) {
            console.warn('Axe violations:', JSON.stringify(results.violations, null, 2));
        }
        expect(nonContrastViolations).toEqual([]);
    });
});
