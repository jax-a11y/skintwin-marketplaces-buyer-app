# Ecosystem Position: skintwin-marketplaces-buyer-app

> This repository is part of the [SkinTwin-AI ecosystem](https://github.com/jax-a11y/skintwin-ecosystem-design).
> Its machine-readable manifest lives at [`.skintwin/manifest.json`](./.skintwin/manifest.json) and is mirrored in the
> ecosystem's source-of-truth registry at `registry/ecosystem.json` in the hub repo.

**Layer:** commerce-surface · **Role:** marketplace-buyer

This app is the buyer-facing marketplace frontend for the SkinTwin AI ecosystem: a Next.js 12 + MUI + Apollo Client storefront where customers discover and purchase skincare products from multiple shops. Originally adapted from Shopify's Marketplace Kit, it sits in the commerce-surface layer as the customer-facing counterpart to the marketplace channel admin app, which serves it shop, product, and order data over GraphQL.

## Provides

Nothing — this is a customer-facing frontend; it consumes the marketplace BFF rather than exposing contracts of its own.

## Consumes

- `marketplace-admin-graphql` — Apollo GraphQL BFF for the marketplace channel (shops, products, orders), provided by [jax-a11y/skintwin-marketplace-admin-app](https://github.com/jax-a11y/skintwin-marketplace-admin-app).

## Events

| Topic | Direction |
|-------|-----------|
| `product.updated` | subscribes |

Payload schemas live at `contracts/events/<topic>.schema.json` in the [hub repo](https://github.com/jax-a11y/skintwin-ecosystem-design).

## CI

This repo runs its own GitHub Actions pipeline: `ci.yml` (yarn, ESLint, `next build`), plus Playwright E2E workflows — see [README section 3](./README.md#3-cicd-workflows). It does not currently call the ecosystem's reusable workflows; those templates are documented in `ci/README.md` in the [hub repo](https://github.com/jax-a11y/skintwin-ecosystem-design).
