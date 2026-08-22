import type { Product } from "@/types/product";

/**
 * Commerce provider boundary — brief §18 ("Prepare adapters so Shopify
 * Storefront API, Stripe, or another approved provider can be connected
 * later without redesigning the interface"). No provider is configured
 * for this build (`shopEnabled: false`) — NullCommerceAdapter below is
 * the active implementation and always returns empty/no-op results. A
 * real Shopify or Stripe-backed adapter implements the same interface
 * and is swapped in via `getCommerceAdapter()` once credentials exist.
 */
export interface CheckoutLineItem {
  productId: string;
  quantity: number;
}

export interface CommerceAdapter {
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  /** Returns a redirect URL to the provider's hosted checkout, or throws if unconfigured. */
  createCheckoutSession(items: CheckoutLineItem[]): Promise<string>;
}

class NullCommerceAdapter implements CommerceAdapter {
  async listProducts(): Promise<Product[]> {
    return [];
  }
  async getProduct(): Promise<Product | null> {
    return null;
  }
  async createCheckoutSession(): Promise<string> {
    throw new Error("No commerce provider is configured — shopEnabled is false and no checkout provider is wired up.");
  }
}

let adapter: CommerceAdapter | null = null;

export function getCommerceAdapter(): CommerceAdapter {
  if (!adapter) adapter = new NullCommerceAdapter();
  return adapter;
}
