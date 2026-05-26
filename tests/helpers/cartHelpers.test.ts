import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the localStorage-based functions
// Since the actual module uses window.localStorage, we mock it

describe('cartHelpers', () => {
  // Store mock localStorage data
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      return mockStorage[key] || null;
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });
  });

  describe('getCartCount', () => {
    it('should return null when cart count is not set', async () => {
      const { getCartCount } = await import('../../helpers/cartHelpers');
      const result = getCartCount();
      expect(result).toBeNull();
    });

    it('should return the cart count when set', async () => {
      mockStorage['cartCount'] = '5';
      const { getCartCount } = await import('../../helpers/cartHelpers');
      const result = getCartCount();
      expect(result).toBe(5);
    });

    it('should return 0 when cart count is zero', async () => {
      mockStorage['cartCount'] = '0';
      const { getCartCount } = await import('../../helpers/cartHelpers');
      const result = getCartCount();
      expect(result).toBe(0);
    });
  });

  describe('setCartCount', () => {
    it('should set the cart count in localStorage', async () => {
      const { setCartCount } = await import('../../helpers/cartHelpers');
      setCartCount(10);
      expect(mockStorage['cartCount']).toBe('10');
    });

    it('should dispatch storage event after setting count', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      const { setCartCount } = await import('../../helpers/cartHelpers');
      setCartCount(5);
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('getCarts', () => {
    it('should return empty object when no carts exist', async () => {
      const { getCarts } = await import('../../helpers/cartHelpers');
      const result = getCarts();
      expect(result).toEqual({});
    });

    it('should return existing carts', async () => {
      const existingCarts = { 'shop1.myshopify.com': 'cart-id-1' };
      mockStorage['carts'] = JSON.stringify(existingCarts);
      const { getCarts } = await import('../../helpers/cartHelpers');
      const result = getCarts();
      expect(result).toEqual(existingCarts);
    });

    it('should initialize empty carts object in localStorage when none exists', async () => {
      const { getCarts } = await import('../../helpers/cartHelpers');
      getCarts();
      expect(mockStorage['carts']).toBe('{}');
    });
  });

  describe('CORE_CART_FIELDS fragment', () => {
    it('should export CORE_CART_FIELDS GraphQL fragment', async () => {
      const { CORE_CART_FIELDS } = await import('../../helpers/cartHelpers');
      expect(CORE_CART_FIELDS).toBeDefined();
      expect(CORE_CART_FIELDS.kind).toBe('Document');
    });
  });

  describe('addToCart', () => {
    it('should be a function', async () => {
      const { addToCart } = await import('../../helpers/cartHelpers');
      expect(typeof addToCart).toBe('function');
    });
  });

  describe('addToCartAndCheckout', () => {
    it('should be a function', async () => {
      const { addToCartAndCheckout } = await import('../../helpers/cartHelpers');
      expect(typeof addToCartAndCheckout).toBe('function');
    });
  });

  describe('removeItemFromCart', () => {
    it('should be a function', async () => {
      const { removeItemFromCart } = await import('../../helpers/cartHelpers');
      expect(typeof removeItemFromCart).toBe('function');
    });
  });

  describe('updateItemCountInCart', () => {
    it('should be a function', async () => {
      const { updateItemCountInCart } = await import('../../helpers/cartHelpers');
      expect(typeof updateItemCountInCart).toBe('function');
    });
  });
});
