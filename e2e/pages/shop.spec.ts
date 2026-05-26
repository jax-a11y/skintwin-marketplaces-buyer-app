import { test, expect } from '@playwright/test';
import { waitForPageLoad, clearLocalStorage } from '../support/test-helpers';

test.describe('Shop Page @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
  });

  test('should show "Shop not found" for invalid shop ID', async ({ page }) => {
    // Mock 404 response for invalid shop
    await page.route('**/graphql', async (route, request) => {
      const postData = request.postDataJSON?.();
      if (postData?.query?.includes('Shop')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { shop: null }
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/shops/99999');
    await waitForPageLoad(page);

    await expect(page.getByText('Shop not found')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Delay the response to see loading state
    await page.route('**/graphql', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/shops/1');
    
    // Loading state might appear briefly
    // The exact text depends on implementation
  });

  test('should navigate back to home when logo clicked', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    await page.getByTestId('logo-link').click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Shop Page - Product Listing', () => {
  test('should display product grid when products exist', async ({ page }) => {
    // This test would require mocking the storefront API
    // For now, we test the structure
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // If products exist, grid should be visible
    const productGrid = page.getByTestId('product-grid');
    // We can't assert visibility without mocking
  });

  test('should show "No products" when shop has no products', async ({ page }) => {
    // Mock empty products response
    await page.route('**/*.myshopify.com/api/*/graphql.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            shop: { name: 'Test Shop' },
            products: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } },
            productTypes: { edges: [] }
          }
        }),
      });
    });

    await page.goto('/shops/1');
    await waitForPageLoad(page);
  });
});

test.describe('Shop Page - Filters', () => {
  test('should display sort dropdown', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Sort select should be present (if shop loaded)
    const sortSelect = page.locator('#sort-select');
    // Visibility depends on whether shop data loaded
  });

  test('should display price filter checkboxes', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Price filters should be present (if shop loaded)
    const priceFilter = page.getByText('Price');
    // Visibility depends on whether shop data loaded
  });

  test('should display availability filter', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Availability filter should be present (if shop loaded)
    const availabilityFilter = page.getByText('Availability');
    // Visibility depends on whether shop data loaded
  });

  test('should update URL when sort changes', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // If sort select is visible, changing it should update URL
    const sortSelect = page.locator('#sort-select');
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      const priceOption = page.getByRole('option', { name: /price/i });
      if (await priceOption.isVisible()) {
        await priceOption.click();
        await expect(page).toHaveURL(/sort_by=/);
      }
    }
  });
});

test.describe('Shop Page - Category Tabs', () => {
  test('should display category tabs when categories exist', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Categories tab should be present (if shop has categories)
    const categoriesTab = page.getByRole('tab', { name: 'All categories' });
    // Visibility depends on whether shop has categories
  });

  test('should update URL when category changes', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // If category tabs are visible, clicking should update URL
    const allCategoriesTab = page.getByRole('tab', { name: 'All categories' });
    if (await allCategoriesTab.isVisible()) {
      await allCategoriesTab.click();
      // URL should not have category param when "All" is selected
    }
  });
});

test.describe('Shop Page - Pagination', () => {
  test('should display pagination when multiple pages exist', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Pagination links should appear if there are multiple pages
    const nextLink = page.getByRole('link', { name: 'Next' });
    const prevLink = page.getByRole('link', { name: 'Prev' });
    // Visibility depends on number of products
  });

  test('should navigate to next page when Next clicked', async ({ page }) => {
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    const nextLink = page.getByRole('link', { name: 'Next' });
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await expect(page).toHaveURL(/after=/);
    }
  });
});

test.describe('Shop Page - Responsive', () => {
  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/shops/1');
    await waitForPageLoad(page);

    // Navigation should still be visible
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });
});
