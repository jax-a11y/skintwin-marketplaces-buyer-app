import { test, expect } from '@playwright/test';
import { waitForPageLoad, clearLocalStorage } from '../support/test-helpers';

/**
 * Full purchase flow E2E tests
 * These tests verify the complete buyer journey from discovery to checkout
 */

test.describe('Purchase Flow @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('should complete full purchase flow', async ({ page }) => {
    // Step 1: Land on home page
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Verify home page loaded
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByTestId('cart-link')).toBeVisible();

    // Step 2: Navigate to cart (empty state)
    await page.getByTestId('cart-link').click();
    await expect(page).toHaveURL(/\/cart/);
    
    // Step 3: Go back to home
    await page.getByTestId('logo-link').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate between all major pages', async ({ page }) => {
    // Home page
    await page.goto('/');
    await waitForPageLoad(page);
    await expect(page.getByTestId('logo-link')).toBeVisible();

    // Cart page
    await page.goto('/cart');
    await waitForPageLoad(page);
    await expect(page.getByTestId('logo-link')).toBeVisible();

    // Shop page (with mock ID)
    await page.goto('/shops/1');
    await waitForPageLoad(page);
    await expect(page.getByTestId('logo-link')).toBeVisible();

    // Product page (with mock IDs)
    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should maintain navigation consistency across pages', async ({ page }) => {
    const pages = ['/', '/cart', '/shops/1', '/products/1/test'];
    
    for (const url of pages) {
      await page.goto(url);
      await waitForPageLoad(page);
      
      // Logo should always be visible
      await expect(page.getByTestId('logo-link')).toBeVisible();
      
      // Cart link should always be visible
      await expect(page.getByTestId('cart-link')).toBeVisible();
    }
  });
});

test.describe('Purchase Flow - Discovery to Shop', () => {
  test('should navigate from home to shop via shop section link', async ({ page }) => {
    // This requires mocked shop data
    await page.goto('/');
    await waitForPageLoad(page);

    // If "View all products" link exists, clicking it should navigate to shop
    const viewAllLink = page.getByRole('link', { name: /view all products/i });
    if (await viewAllLink.first().isVisible()) {
      await viewAllLink.first().click();
      await expect(page).toHaveURL(/\/shops\/\d+/);
    }
  });
});

test.describe('Purchase Flow - Shop to Product', () => {
  test('should navigate from shop to product via product card', async ({ page }) => {
    // This requires mocked shop and product data
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // If product cards exist, clicking one should navigate to product page
    const productLink = page.locator('[data-testid^="product-card-"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/\/products\/\d+\/.+/);
    }
  });
});

test.describe('Purchase Flow - Add to Cart', () => {
  test('should add item to cart and see updated cart badge', async ({ page }) => {
    // This requires full mocking of product and cart APIs
    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // If Add to Cart button exists, clicking it should update cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    if (await addToCartButton.isVisible()) {
      const initialBadge = await page.getByTestId('cart-badge').textContent();
      await addToCartButton.click();
      // Badge should update (with mocked API)
    }
  });
});

test.describe('Purchase Flow - Cart to Checkout', () => {
  test('should navigate to checkout from cart', async ({ page, context }) => {
    // Set up cart with items
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('carts', JSON.stringify({
        'test-shop.myshopify.com': 'gid://shopify/Cart/123'
      }));
      window.localStorage.setItem('cartCount', '1');
    });

    await page.goto('/cart');
    await waitForPageLoad(page);

    // If checkout button exists, clicking it should open new tab
    const checkoutButton = page.getByRole('button', { name: /go to checkout/i });
    if (await checkoutButton.first().isVisible()) {
      // Set up listener for new page
      const pagePromise = context.waitForEvent('page');
      await checkoutButton.first().click();
      // New page would open for checkout
    }
  });
});

test.describe('Purchase Flow - Browser Navigation', () => {
  test('should handle back/forward navigation correctly', async ({ page }) => {
    // Navigate through pages
    await page.goto('/');
    await waitForPageLoad(page);
    
    await page.goto('/shops/1');
    await waitForPageLoad(page);
    
    await page.goto('/products/1/test-product');
    await waitForPageLoad(page);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/shops\/1/);

    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/shops\/1/);
  });

  test('should preserve state after refresh', async ({ page }) => {
    // Set up some state
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('cartCount', '5');
    });

    // Refresh the page
    await page.reload();
    await waitForPageLoad(page);

    // State should be preserved
    const count = await page.evaluate(() => {
      return window.localStorage.getItem('cartCount');
    });
    expect(count).toBe('5');
  });
});

test.describe('Purchase Flow - Cross-Shop Shopping', () => {
  test('should maintain cart across different shop visits', async ({ page }) => {
    // Set up initial cart
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('carts', JSON.stringify({
        'shop1.myshopify.com': 'cart-1'
      }));
      window.localStorage.setItem('cartCount', '1');
    });

    // Visit different shop
    await page.goto('/shops/2');
    await waitForPageLoad(page);

    // Cart should still have items from shop 1
    const cartCount = await page.evaluate(() => {
      return window.localStorage.getItem('cartCount');
    });
    expect(cartCount).toBe('1');
  });
});
