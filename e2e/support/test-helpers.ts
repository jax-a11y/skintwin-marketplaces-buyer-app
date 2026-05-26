import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for SkinTwin Marketplace E2E tests
 */

/**
 * Wait for the page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for a specific element to be visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Clear local storage (useful for resetting cart state)
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.clear();
  });
}

/**
 * Set cart count in localStorage
 */
export async function setCartCount(page: Page, count: number): Promise<void> {
  await page.evaluate((c) => {
    window.localStorage.setItem('cartCount', JSON.stringify(c));
    window.dispatchEvent(new Event('storage'));
  }, count);
}

/**
 * Get cart count from localStorage
 */
export async function getCartCount(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const count = window.localStorage.getItem('cartCount');
    return count ? JSON.parse(count) : null;
  });
}

/**
 * Set carts data in localStorage
 */
export async function setCarts(
  page: Page,
  carts: Record<string, string>
): Promise<void> {
  await page.evaluate((c) => {
    window.localStorage.setItem('carts', JSON.stringify(c));
  }, carts);
}

/**
 * Check if element exists and is visible
 */
export async function isElementVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible();
  return isVisible;
}

/**
 * Click element by test id
 */
export async function clickByTestId(
  page: Page,
  testId: string
): Promise<void> {
  await page.getByTestId(testId).click();
}

/**
 * Get text content by test id
 */
export async function getTextByTestId(
  page: Page,
  testId: string
): Promise<string | null> {
  return page.getByTestId(testId).textContent();
}

/**
 * Fill input by test id
 */
export async function fillByTestId(
  page: Page,
  testId: string,
  value: string
): Promise<void> {
  await page.getByTestId(testId).fill(value);
}

/**
 * Select option by test id
 */
export async function selectByTestId(
  page: Page,
  testId: string,
  value: string
): Promise<void> {
  await page.getByTestId(testId).selectOption(value);
}

/**
 * Screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png` });
}

/**
 * Assert page title
 */
export async function assertPageTitle(
  page: Page,
  expectedTitle: string
): Promise<void> {
  await expect(page).toHaveTitle(expectedTitle);
}

/**
 * Assert URL contains path
 */
export async function assertUrlContains(
  page: Page,
  path: string
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(path));
}

/**
 * Assert element count
 */
export async function assertElementCount(
  page: Page,
  selector: string,
  expectedCount: number
): Promise<void> {
  const elements = page.locator(selector);
  await expect(elements).toHaveCount(expectedCount);
}

/**
 * Mock GraphQL response
 */
export async function mockGraphQLResponse(
  page: Page,
  operationName: string,
  response: object
): Promise<void> {
  await page.route('**/graphql', async (route, request) => {
    const postData = request.postDataJSON();
    if (postData?.operationName === operationName) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock all GraphQL requests to fail
 */
export async function mockGraphQLError(
  page: Page,
  statusCode = 500
): Promise<void> {
  await page.route('**/graphql', async (route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [{ message: 'Internal server error' }],
        data: null,
      }),
    });
  });
}

/**
 * Mock network delay
 */
export async function mockNetworkDelay(
  page: Page,
  delayMs: number
): Promise<void> {
  await page.route('**/graphql', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
}
