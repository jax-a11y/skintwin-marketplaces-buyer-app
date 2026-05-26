<h1 align="center">SkinTwin Marketplaces Buyer App</h1>

<p align="center">
  <a href="https://github.com/skintwin-ai/skintwin-marketplaces-buyer-app/actions/workflows/ci.yml">
    <img src="https://github.com/skintwin-ai/skintwin-marketplaces-buyer-app/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://github.com/skintwin-ai/skintwin-marketplaces-buyer-app/actions/workflows/e2e-full.yml">
    <img src="https://github.com/skintwin-ai/skintwin-marketplaces-buyer-app/actions/workflows/e2e-full.yml/badge.svg" alt="E2E Status">
  </a>
</p>

A buyer-facing marketplace application for the **SkinTwin AI** beauty-tech ecosystem. Built with [Next.js](https://nextjs.org/), this app enables discovery and purchase of skincare products from multiple shops.

Originally based on Shopify's Marketplace Kit, this application has been adapted for the skintwin-ai organization with comprehensive CI/CD pipelines and an exhaustive E2E test suite.

---

- [1. Getting Started](#1-getting-started)
- [2. Testing](#2-testing)
- [3. CI/CD Workflows](#3-cicd-workflows)
- [4. Code Structure](#4-code-structure)
- [5. Key Tech](#5-key-tech)
- [6. License](#6-license)

---

## 1. Getting Started

**Requirements:**

- Node.js 24+ (see `.nvmrc`)
- [yarn](https://yarnpkg.com/en/)
- Backend API server running at configured endpoint

**Clone this repository:**

```bash
git clone https://github.com/skintwin-ai/skintwin-marketplaces-buyer-app
cd skintwin-marketplaces-buyer-app
```

**Set up environment:**

```bash
cp .env.local.example .env.local
# Edit .env.local with your API endpoint
```

**Install dependencies:**

```bash
yarn install
```

**Run development server:**

```bash
yarn dev
```

**Open in browser:**

Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

## 2. Testing

This project includes comprehensive test coverage with both unit tests and E2E tests.

### Unit Tests (Vitest)

```bash
# Run tests in watch mode
yarn test

# Run tests once
yarn test:run

# Run with coverage
yarn test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
yarn test:e2e

# Run with UI mode
yarn test:e2e:ui

# Run headed (visible browser)
yarn test:e2e:headed

# Debug mode
yarn test:e2e:debug

# View test report
yarn test:e2e:report
```

For more details, see [TESTING.md](./TESTING.md).

## 3. CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PRs, push to main | Lint, build, unit tests |
| `e2e-smoke.yml` | PRs | Quick Chromium E2E smoke tests |
| `e2e-full.yml` | Push to main, daily schedule | Cross-browser E2E matrix |
| `release-gate.yml` | Manual dispatch | Full validation for deployments |

## 4. Code Structure

Familiarize yourself with the code structure for the buyer-facing app.

<table>
  <caption>Code structure</caption>
  <tr>
    <th scope="col">Folder/file</th>
    <th scope="col">Contains</th>
  </tr>
  <tr>
    <td><code>pages/*</code></td>
    <td>All Next.js routes and page components.</td>
  </tr>
  <tr>
    <td><code>components/*</code></td>
    <td>Reusable React components used across pages.</td>
  </tr>
  <tr>
    <td><code>helpers/*</code></td>
    <td>Utility functions (cart operations, etc.).</td>
  </tr>
  <tr>
    <td><code>lib/*</code></td>
    <td>Configuration and API setup.</td>
  </tr>
  <tr>
    <td><code>tests/*</code></td>
    <td>Unit tests (Vitest + React Testing Library).</td>
  </tr>
  <tr>
    <td><code>e2e/*</code></td>
    <td>End-to-end tests (Playwright).</td>
  </tr>
  <tr>
    <td><code>public/*</code></td>
    <td>Static assets (images, favicon, etc.).</td>
  </tr>
  <tr>
    <td><code>.github/workflows/*</code></td>
    <td>CI/CD pipeline definitions.</td>
  </tr>
</table>


## 5. Key Tech

- **Framework**: [Next.js](https://nextjs.org/) 12 with [React](https://reactjs.org/) 17
- **UI Library**: [MUI (Material-UI)](https://mui.com/) v5
- **Data Fetching**: [GraphQL](https://graphql.org/) with Apollo Client
- **Unit Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)
- **E2E Testing**: [Playwright](https://playwright.dev/) with [axe-core](https://www.deque.com/axe/) for accessibility
- **CI/CD**: GitHub Actions

## 6. License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
