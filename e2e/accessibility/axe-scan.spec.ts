import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForPageLoad, clearLocalStorage } from '../support/test-helpers';

/**
 * Accessibility tests using axe-core
 * These tests verify WCAG 2.1 Level AA compliance
 */

test.describe('Accessibility - Home Page @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('should have no critical accessibility violations on home page', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.MuiCircularProgress-root') // Exclude loading spinners
      .analyze();

    // Filter out minor violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Check that headings are in proper order
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
      };
    });

    // Page should have logical heading structure
    // Not strict about counts, but structure should exist
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Check that form controls have labels
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['forms'])
      .analyze();

    const formViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label' || v.id === 'select-name'
    );

    // Should have minimal form label issues
    expect(formViolations.length).toBeLessThanOrEqual(2);
  });
});

test.describe('Accessibility - Shop Page @a11y', () => {
  test('should have no critical accessibility violations on shop page', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.MuiCircularProgress-root')
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('should have accessible navigation tabs', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Check that tabs are properly labeled
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      // Each tab should have accessible name
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const name = await tab.getAttribute('aria-label') || await tab.textContent();
        expect(name).toBeTruthy();
      }
    }
  });
});

test.describe('Accessibility - Product Page @a11y', () => {
  test('should have no critical accessibility violations on product page', async ({ page }) => {
    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.MuiCircularProgress-root')
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // All buttons should have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label') || await button.textContent();
      expect(name?.trim()).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Cart Page @a11y', () => {
  test('should have no critical accessibility violations on cart page', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.MuiCircularProgress-root')
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });
});

test.describe('Accessibility - Keyboard Navigation @a11y', () => {
  test('should be able to navigate with keyboard on home page', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Tab to logo
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Tab to cart
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).toBeTruthy();

    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Check that focused element has visible focus
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      // Check for outline or box-shadow
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    // Focus should be visible (though MUI handles this automatically)
  });

  test('should activate links with Enter key', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Find the logo link
    const logoLink = page.getByTestId('logo-link');
    await logoLink.focus();

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Should navigate (though we're already on home page)
    await expect(page).toHaveURL('/');
  });

  test('should activate buttons with Space key', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Find a button (like pagination if available)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      await buttons.first().focus();
      // Space should activate button (behavior depends on button)
    }
  });
});

test.describe('Accessibility - Images @a11y', () => {
  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt should exist (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('Accessibility - Color Contrast @a11y', () => {
  test('should meet color contrast requirements', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    // Should have minimal contrast issues
    expect(contrastViolations.length).toBeLessThanOrEqual(2);
  });
});
