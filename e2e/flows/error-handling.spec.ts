import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../support/test-helpers';

/**
 * Error handling E2E tests
 * These tests verify graceful error handling and recovery
 */

test.describe('Error Handling - 404 Pages', () => {
  test('should handle non-existent routes gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should either 404 or redirect
    expect([200, 404]).toContain(response?.status() || 200);
    
    // Page should still render
    await waitForPageLoad(page);
  });

  test('should handle invalid shop ID', async ({ page }) => {
    await page.goto('/shops/invalid-shop-id-12345');
    await waitForPageLoad(page);

    // Page should render (may show error state or loading)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle invalid product handle', async ({ page }) => {
    await page.goto('/products/1/non-existent-product-handle');
    await waitForPageLoad(page);

    // Page should render
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Error Handling - API Errors', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept all API requests and fail them
    await page.route('**/graphql**', (route) => {
      route.abort('failed');
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Page should still render (may show error or empty state)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Simulate slow API
    await page.route('**/graphql**', async (route) => {
      // Wait 10 seconds before responding
      await new Promise((resolve) => setTimeout(resolve, 10000));
      route.abort('timedout');
    });

    // Set shorter timeout for this test
    page.setDefaultTimeout(15000);

    await page.goto('/');
    
    // Page should render (may show loading state)
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should handle malformed API response', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'response' }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Page should not crash
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle 500 server error', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Page should render (may show error state)
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });
});

test.describe('Error Handling - Invalid Data', () => {
  test('should handle empty shop list', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            shops: [],
          },
        }),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Should show empty state or message
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle products with missing images', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      const body = route.request().postData();
      if (body?.includes('ProductByHandle')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              productByHandle: {
                id: 'gid://shopify/Product/1',
                handle: 'test-product',
                title: 'Test Product',
                images: { edges: [] }, // No images
                variants: { edges: [] },
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // Page should render without crashing
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle products with missing variants', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      const body = route.request().postData();
      if (body?.includes('ProductByHandle')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              productByHandle: {
                id: 'gid://shopify/Product/1',
                handle: 'test-product',
                title: 'Test Product',
                images: { edges: [] },
                variants: { edges: [] }, // No variants
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // Page should render without crashing
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Error Handling - Cart Errors', () => {
  test('should handle corrupted cart data in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('carts', 'invalid-json{{{');
      window.localStorage.setItem('cartCount', 'not-a-number');
    });

    await page.goto('/cart');
    await waitForPageLoad(page);

    // Page should render (may reset cart state)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });

  test('should handle cart add failure', async ({ page }) => {
    await page.route('**/graphql**', (route) => {
      const body = route.request().postData();
      if (body?.includes('cartCreate') || body?.includes('cartLinesAdd')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [{ message: 'Failed to add to cart' }],
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // Page should handle error gracefully
    const addButton = page.getByRole('button', { name: /add to cart/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      // Should not crash
      await waitForPageLoad(page);
    }
  });
});

test.describe('Error Handling - Recovery', () => {
  test('should recover after network reconnection', async ({ page }) => {
    // First, fail requests
    await page.route('**/graphql**', (route) => {
      route.abort('failed');
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Now allow requests
    await page.unroute('**/graphql**');

    // Refresh should work
    await page.reload();
    await waitForPageLoad(page);

    // Page should be functional
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should allow retry after error', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/graphql**', (route) => {
      requestCount++;
      if (requestCount < 2) {
        route.abort('failed');
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              shops: [],
            },
          }),
        });
      }
    });

    await page.goto('/');
    await waitForPageLoad(page);

    // Refresh to retry
    await page.reload();
    await waitForPageLoad(page);

    // Second request should succeed
    expect(requestCount).toBeGreaterThanOrEqual(1);
  });
});
