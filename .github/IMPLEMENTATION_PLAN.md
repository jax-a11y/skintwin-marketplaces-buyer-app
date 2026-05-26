# Skintwin buyer app optimization implementation plan

## 1. Current repository baseline

This repository is a Next.js 12 buyer-facing marketplace app that currently provides:

- runtime scripts in `package.json`: `yarn dev`, `yarn build`, `yarn start`, `yarn lint`
- route-driven UI in:
  - `pages/index.js`
  - `pages/shops/[id].js`
  - `pages/products/[shopid]/[producthandle].js`
  - `pages/cart/index.js`
- shared UI and helpers in:
  - `components/page.js`
  - `components/productGrid.js`
  - `helpers/cartHelpers.js`
- a single GitHub Actions workflow in `.github/workflows/cla.yml`

The repository does **not** currently include:

- unit or integration test tooling
- end-to-end test tooling
- build validation in GitHub Actions
- preview/smoke test workflows
- fixture or mock data strategy for Shopify/GraphQL dependencies

## 2. Target outcome

Optimize this codebase for `https://github.com/skintwin-ai` by delivering:

1. a reproducible local developer workflow
2. comprehensive build CI in GitHub Actions
3. an exhaustive e2e suite that covers all buyer-critical journeys
4. fast feedback on pull requests
5. stable deployment confidence through deterministic mocks and artifacts

## 3. Implementation phases

### Phase 1: stabilize the app surface before adding tests

1. Document and pin the supported runtime:
   - add `.nvmrc` and/or `engines` in `package.json`
   - standardize local and CI Node/Yarn versions
2. Remove avoidable lint warnings in files that will become e2e-critical:
   - `components/page.js`
   - `components/productGrid.js`
   - `pages/cart/index.js`
   - `pages/products/[shopid]/[producthandle].js`
   - `pages/shops/[id].js`
3. Add deterministic selectors for automation:
   - prefer `data-testid` or stable `aria-label` values on search, filters, product cards, add-to-cart, cart totals, and checkout CTAs
4. Isolate external dependencies:
   - centralize GraphQL and Storefront API configuration
   - make the app runnable against mock/test endpoints without editing page files manually

### Phase 2: add the missing automated test pyramid

1. Add a unit/integration test runner for component and helper coverage:
   - `helpers/cartHelpers.js`
   - rendering logic in `components/productGrid.js`
   - route-level state transitions in the pages above
2. Add browser e2e tooling with Playwright as the primary choice because it:
   - integrates cleanly with GitHub Actions
   - supports traces, screenshots, retries, and web-first assertions
   - can run accessibility assertions in the same flow
3. Introduce scripts in `package.json` such as:
   - `test`
   - `test:unit`
   - `test:e2e`
   - `test:e2e:headed` or `test:e2e:debug`
4. Add shared fixtures/mocks for:
   - home page shop discovery payloads
   - shop detail payloads
   - product detail payloads
   - cart create/update/remove flows
   - empty, loading, and error responses

### Phase 3: define exhaustive e2e coverage

The e2e suite should cover the full buyer funnel and key regressions:

#### Core user journeys

1. **Landing and discovery**
   - home page loads without runtime errors
   - featured shops/products render
   - navigation to a shop works
2. **Shop page**
   - shop data renders correctly
   - product listing, sorting, filtering, and pagination/infinite scrolling behave correctly
   - unavailable or missing shop states show resilient UI
3. **Product page**
   - product details, price, variants, and images render
   - variant changes update purchasable state
   - add-to-cart works with expected quantity and price
   - invalid handles show expected fallback behavior
4. **Cart**
   - line items render after add-to-cart
   - quantity increment/decrement updates totals
   - item removal updates totals and empty-cart state
   - checkout action uses the expected target URL
5. **Error handling**
   - API failure states render user-safe messaging
   - loading states are visible and recover correctly
6. **Responsive behavior**
   - smoke coverage on mobile and desktop breakpoints
7. **Accessibility-critical checks**
   - keyboard navigation across navigation, product cards, and cart actions
   - headings, buttons, links, and images expose accessible names
   - automated axe scan on core routes

#### Recommended route matrix

- `/`
- `/shops/[id]`
- `/products/[shopid]/[producthandle]`
- `/cart`

#### Recommended data scenarios

- happy path populated catalog
- empty catalog
- out-of-stock product
- malformed or missing image
- API timeout / 5xx equivalent
- invalid shop id
- invalid product handle

### Phase 4: build comprehensive GitHub Actions CI

Add dedicated workflows alongside `.github/workflows/cla.yml`:

#### `ci.yml`

Run on `pull_request` and `push` to the default branch.

Jobs:

1. **install**
   - checkout
   - setup Node/Yarn
   - restore dependency cache
   - install with frozen lockfile
2. **lint**
   - run `yarn lint`
3. **build**
   - run `yarn build`
   - upload build artifacts when useful for debugging
4. **unit-tests**
   - run the unit/integration suite
5. **e2e-smoke**
   - run a reduced Playwright suite on PRs for fast feedback

#### `e2e.yml`

Use for full browser coverage on merges, nightly schedules, and manual dispatch.

Jobs:

1. matrix by browser: `chromium`, `firefox`, `webkit`
2. optional matrix by viewport: desktop + mobile
3. start the app in production mode
4. run full Playwright suite with retries enabled in CI
5. upload traces, videos, screenshots, and junit/html reports on failure

#### `release-readiness.yml` (optional but valuable)

Run a stricter gate before production deployments:

- lint
- build
- full unit suite
- full e2e suite
- accessibility assertions

### Phase 5: optimize for reliability and PR feedback speed

1. Use GitHub Actions `concurrency` to cancel superseded runs.
2. Cache Yarn dependencies and Playwright browsers.
3. Split smoke vs full e2e to keep PR turnaround low.
4. Fail fast on install/lint/build before running long browser jobs.
5. Publish artifacts for every failed e2e run so debugging does not require reruns.

## 4. Suggested repository changes

### `package.json`

- add explicit test scripts
- add any required devDependencies for unit/e2e testing
- optionally add runtime engine metadata

### `.github/workflows/*`

- add CI workflows for lint/build/test/e2e
- keep CLA workflow unchanged

### `tests/` and/or `e2e/`

- add unit/integration tests
- add Playwright specs and fixtures

### app files

Add stable automation hooks and fix flaky DOM behavior in:

- `components/page.js`
- `components/productGrid.js`
- `pages/index.js`
- `pages/shops/[id].js`
- `pages/products/[shopid]/[producthandle].js`
- `pages/cart/index.js`

## 5. Definition of done

Implementation is complete when:

1. `yarn lint` passes cleanly
2. `yarn build` passes in CI
3. unit/integration tests run in CI
4. PRs run a smoke e2e suite automatically
5. the default branch runs a full cross-browser e2e suite automatically
6. failed e2e runs publish traces/screenshots/videos
7. the main buyer journeys and failure states listed above are covered by automated tests
8. local setup instructions explain how to run build, unit tests, and e2e tests without manual code edits

## 6. Recommended delivery order

1. runtime/config cleanup
2. deterministic selectors and error-state hardening
3. unit/integration harness
4. Playwright harness with mocked backend
5. PR smoke workflow
6. full scheduled/manual e2e workflow
7. accessibility and regression hardening

## 7. Key risks to manage

- current pages appear to depend on live GraphQL/Shopify-style data, so tests may be flaky until mocks are introduced
- missing stable selectors will make e2e tests brittle
- existing lint warnings indicate some DOM and hook behaviors should be cleaned up before broad CI enforcement
- external font/network usage during build should be controlled so CI stays deterministic
