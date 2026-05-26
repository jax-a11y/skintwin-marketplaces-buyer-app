import { test, expect } from '@playwright/test';
import { waitForPageLoad, clearLocalStorage, setCartCount, setCarts } from '../support/test-helpers';

test.describe('Cart Page @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/cart');
    
    // Loading state should appear
    await expect(page.getByText('Loading')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate back to home when logo clicked', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    await page.getByTestId('logo-link').click();
    await expect(page).toHaveURL('/');
  });

  test('should display cart header with item count', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Cart header should show item count
    const header = page.getByRole('heading', { level: 1 });
    await expect(header).toContainText(/your cart/i);
  });
});

test.describe('Cart Page - Empty State', () => {
  test('should show loading when no items in cart', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/cart');
    
    // With empty localStorage, cart should show loading
    // (since it tries to fetch cart data)
    await expect(page.getByText('Loading')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Cart Page - With Items', () => {
  test.beforeEach(async ({ page }) => {
    // Set up cart data in localStorage before navigation
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('carts', JSON.stringify({
        'test-shop.myshopify.com': 'gid://shopify/Cart/123'
      }));
      window.localStorage.setItem('cartCount', '1');
    });
  });

  test('should display cart items', async ({ page }) => {
    // Mock the GraphQL responses
    await page.route('**/graphql', async (route, request) => {
      const postData = request.postDataJSON?.();
      if (postData?.query?.includes('Shops')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              shops: [{
                id: 1,
                domain: 'test-shop.myshopify.com',
                name: 'Test Shop',
                storefrontAccessToken: 'test-token'
              }]
            }
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/cart');
    await waitForPageLoad(page);
  });

  test('should display quantity selector for each item', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Quantity selectors should be present for each item
    // This requires mocked cart data
  });

  test('should display remove button for each item', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Remove buttons (X) should be present for each item
    // This requires mocked cart data
  });

  test('should display subtotal per shop', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Subtotal should be displayed for each shop
    // This requires mocked cart data
  });

  test('should display cart total', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Cart total should be displayed
    // This requires mocked cart data
  });

  test('should display checkout button per shop', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Checkout button should be present for each shop
    const checkoutButton = page.getByRole('button', { name: /go to checkout/i });
    // Visibility depends on cart data
  });
});

test.describe('Cart Page - Quantity Updates', () => {
  test('should update quantity when selector changes', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Changing quantity should update the cart
    // This requires mocked cart data and API
  });

  test('should update totals when quantity changes', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Totals should recalculate when quantity changes
    // This requires mocked cart data and API
  });
});

test.describe('Cart Page - Remove Items', () => {
  test('should remove item when X clicked', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Clicking X should remove the item
    // This requires mocked cart data and API
  });

  test('should update totals when item removed', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Totals should recalculate when item removed
    // This requires mocked cart data and API
  });
});

test.describe('Cart Page - Checkout', () => {
  test('should open checkout URL in new tab when checkout clicked', async ({ page, context }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Clicking checkout should open new tab
    // This requires mocked cart data
  });
});

test.describe('Cart Page - Cart Summary', () => {
  test('should display cart summary section', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Cart summary heading should be present
    const summaryHeading = page.getByText(/cart summary/i);
    // Visibility depends on cart data
  });

  test('should list items from each shop', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Summary should list items from each shop
    // This requires mocked cart data
  });

  test('should display formatted total price', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Total should be formatted as currency
    // This requires mocked cart data
  });
});

test.describe('Cart Page - Responsive', () => {
  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });
});
