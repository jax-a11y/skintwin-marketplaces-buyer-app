/**
 * Centralized configuration for SkinTwin Marketplaces Buyer App
 * Environment variables can be set in .env.local
 */

// GraphQL endpoint for the marketplace admin backend
export const GRAPHQL_ENDPOINT = 
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8081/graphql';

// Storefront API version
export const STOREFRONT_API_VERSION = 
  process.env.NEXT_PUBLIC_STOREFRONT_API_VERSION || '2021-10';

/**
 * Build the Storefront API URL for a given shop domain
 * @param {string} domain - The shop domain (e.g., "shop.myshopify.com")
 * @returns {string} The full GraphQL endpoint URL
 */
export const getStorefrontApiUrl = (domain) => {
  return `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`;
};

export default {
  GRAPHQL_ENDPOINT,
  STOREFRONT_API_VERSION,
  getStorefrontApiUrl,
};
