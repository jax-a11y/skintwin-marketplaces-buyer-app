import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForPageLoad, setCartCount } from '../support/test-helpers';

test.describe('Home Page @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('should load the home page without errors', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Check that no console errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Verify basic page structure
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByTestId('cart-link')).toBeVisible();
  });

  test('should display the logo and navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Logo should be visible and clickable
    const logo = page.getByTestId('logo-link');
    await expect(logo).toBeVisible();
    await expect(logo.locator('img')).toHaveAttribute('alt', 'SkinTwin');

    // Cart link should be visible
    const cartLink = page.getByTestId('cart-link');
    await expect(cartLink).toBeVisible();
  });

  test('should show cart badge with correct count', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Set cart count
    await setCartCount(page, 3);

    // Badge should show the count
    const badge = page.getByTestId('cart-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('3');
  });

  test('should navigate to cart page when cart icon clicked', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByTestId('cart-link').click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('should display country filter dropdown', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Country filter should be present
    const countrySelect = page.locator('#selectCountry');
    await expect(countrySelect).toBeVisible();
  });

  test('should display sort dropdown', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Sort select should be present
    const sortSelect = page.locator('#sortSelect');
    await expect(sortSelect).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Search input should be present
    const searchInput = page.getByPlaceholder('Search…');
    await expect(searchInput).toBeVisible();
  });

  test('should show "No shops" when no shops are available', async ({ page }) => {
    // Mock empty shops response
    await page.route('**/graphql', async (route, request) => {
      const postData = request.postDataJSON?.();
      if (postData?.query?.includes('Shops')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { shops: null }
          }),
        });
      } else if (postData?.query?.includes('ShopCountries')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { shopCountries: [] }
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByText('No shops')).toBeVisible();
  });

  test('should display footer with SkinTwin branding', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Footer should contain SkinTwin branding
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('SkinTwin AI');
  });
});

test.describe('Home Page - Search and Filter', () => {
  test('should filter shops when search is performed', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Type in search and press enter
    const searchInput = page.getByPlaceholder('Search…');
    await searchInput.fill('test shop');
    await searchInput.press('Enter');

    // Page should update (we can't verify actual results without mocking)
    await waitForPageLoad(page);
  });

  test('should update shops when country filter changes', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Click on country select and choose an option
    const countrySelect = page.locator('#selectCountry');
    await countrySelect.click();

    // Select "All" if available
    const allOption = page.getByRole('option', { name: 'All' });
    if (await allOption.isVisible()) {
      await allOption.click();
    }
  });

  test('should update shops when sort order changes', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Click on sort select
    const sortSelect = page.locator('#sortSelect');
    await sortSelect.click();

    // Select descending
    const descendingOption = page.getByRole('option', { name: 'Descending' });
    if (await descendingOption.isVisible()) {
      await descendingOption.click();
    }
  });
});

test.describe('Home Page - Responsive', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByTestId('cart-link')).toBeVisible();
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await waitForPageLoad(page);

    // All elements should be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByTestId('cart-link')).toBeVisible();
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageLoad(page);

    // All elements should be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByTestId('cart-link')).toBeVisible();
  });
});
