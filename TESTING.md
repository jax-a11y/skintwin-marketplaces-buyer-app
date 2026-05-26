# Testing Guide

This document describes the testing architecture and how to run tests for the SkinTwin Marketplaces Buyer App.

## Overview

The project uses a comprehensive testing strategy with two main approaches:

1. **Unit Tests** (Vitest + React Testing Library) - Fast, focused tests for components and utilities
2. **E2E Tests** (Playwright) - Full browser-based tests for user flows and accessibility

## Test Structure

```
├── tests/                      # Unit tests
│   ├── setup.ts               # Test setup and mocks
│   ├── helpers/               # Tests for helper functions
│   │   └── cartHelpers.test.ts
│   └── components/            # Component tests
│       └── productGrid.test.tsx
│
├── e2e/                       # End-to-end tests
│   ├── fixtures/              # Mock data for tests
│   │   ├── shops.json
│   │   ├── products.json
│   │   ├── carts.json
│   │   └── errors.json
│   ├── pages/                 # Page-specific tests
│   │   ├── home.spec.ts
│   │   ├── shop.spec.ts
│   │   ├── product.spec.ts
│   │   └── cart.spec.ts
│   ├── flows/                 # User flow tests
│   │   ├── purchase.spec.ts
│   │   └── error-handling.spec.ts
│   ├── accessibility/         # A11y tests
│   │   └── axe-scan.spec.ts
│   └── support/               # Test utilities
│       └── test-helpers.ts
```

## Unit Tests (Vitest)

### Running Unit Tests

```bash
# Run in watch mode (development)
yarn test

# Run once (CI)
yarn test:run

# Run with coverage report
yarn test:coverage
```

### Writing Unit Tests

Unit tests are located in the `tests/` directory and use Vitest with React Testing Library.

**Example component test:**

```typescript
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../../components/productGrid';

describe('ProductGrid', () => {
  it('renders products correctly', () => {
    const products = [
      { node: { id: '1', title: 'Test Product', ... } }
    ];
    
    render(<ProductGrid products={products} shop={mockShop} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

**Example helper test:**

```typescript
import { addToCart, getCartCount } from '../../helpers/cartHelpers';

describe('cartHelpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds item to cart and increments count', async () => {
    await addToCart(mockVariant, mockShop);
    expect(getCartCount()).toBe(1);
  });
});
```

### Coverage

Coverage reports are generated in the `coverage/` directory. The configuration targets:

- `helpers/**` - Business logic
- `components/**` - React components

## E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run with interactive UI
yarn test:e2e:ui

# Run with visible browser
yarn test:e2e:headed

# Debug a specific test
yarn test:e2e:debug

# View HTML report
yarn test:e2e:report
```

### Browser Matrix

Tests run across multiple browsers and viewports:

| Browser | Viewport | Project Name |
|---------|----------|--------------|
| Chromium | Desktop | `chromium` |
| Chromium | Mobile | `mobile-chrome` |
| Firefox | Desktop | `firefox` |
| WebKit | Desktop | `webkit` |
| WebKit | Mobile | `mobile-safari` |

### Test Tags

Tests are tagged for selective running:

- `@smoke` - Quick smoke tests for PRs
- `@a11y` - Accessibility tests

```bash
# Run only smoke tests
yarn test:e2e --grep @smoke

# Run only accessibility tests
yarn test:e2e --grep @a11y
```

### Writing E2E Tests

**Using test IDs:**

The app uses `data-testid` attributes for reliable element selection:

```typescript
// Good - uses test ID
await page.getByTestId('cart-link').click();

// Avoid - fragile selector
await page.locator('.header a:last-child').click();
```

**Available test IDs:**

| Element | Test ID |
|---------|---------|
| Logo link | `logo-link` |
| Cart link | `cart-link` |
| Cart badge | `cart-badge` |
| Product card | `product-card-{id}` |
| Product image | `product-image-{id}` |
| Product title | `product-title-{id}` |
| Product price | `product-price-{id}` |

### Fixtures

Mock data is stored in `e2e/fixtures/`:

- `shops.json` - Shop entities
- `products.json` - Product data with variants
- `carts.json` - Cart states
- `errors.json` - Error response templates

### Accessibility Testing

Accessibility tests use axe-core to scan for WCAG violations:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no critical a11y violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
    
  const criticalViolations = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  );
  
  expect(criticalViolations).toHaveLength(0);
});
```

## CI/CD Integration

### Workflows

| Workflow | Trigger | Tests Run |
|----------|---------|-----------|
| `ci.yml` | PRs, push to main | Lint, build, unit tests |
| `e2e-smoke.yml` | PRs | Chromium smoke tests |
| `e2e-full.yml` | Push to main, daily | Full browser matrix |
| `release-gate.yml` | Manual | All tests + a11y audit |

### Artifacts

Failed tests upload:

- `playwright-report/` - HTML report
- `test-results/` - Screenshots, traces, videos

Coverage reports upload:

- `coverage/` - Istanbul coverage report

## Best Practices

### Unit Tests

1. **Isolate tests** - Clear localStorage/mocks between tests
2. **Test behavior** - Focus on what users see, not implementation
3. **Mock network** - Use MSW or mock functions for API calls
4. **Keep fast** - Unit tests should complete in milliseconds

### E2E Tests

1. **Use test IDs** - Prefer `data-testid` over CSS selectors
2. **Wait properly** - Use `waitForPageLoad` helper
3. **Tag appropriately** - Mark smoke tests with `@smoke`
4. **Handle flakiness** - Add retries for network-dependent tests

### General

1. **Don't skip tests** - Fix flaky tests instead of skipping
2. **Write descriptive names** - Test names should explain the scenario
3. **Keep fixtures updated** - Update mock data when models change
4. **Review coverage** - Aim for meaningful coverage, not just percentages

## Troubleshooting

### "Test timeout exceeded"

- Increase timeout in `playwright.config.ts`
- Check if the dev server is starting correctly
- Verify network mocks are set up

### "Element not found"

- Ensure `data-testid` attribute exists in component
- Check if element is rendered conditionally
- Use `await page.waitForSelector()` if needed

### "Flaky tests in CI"

- Add retries: `test.describe.configure({ retries: 2 })`
- Use `waitForPageLoad` helper
- Check for race conditions in async code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
