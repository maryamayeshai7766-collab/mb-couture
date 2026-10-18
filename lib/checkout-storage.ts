export const CART_STORAGE_KEY = "mb-couture-cart";
export const CHECKOUT_ITEMS_KEY = "mb-couture-checkout-items";
export const IDEMPOTENCY_KEY = "mb-couture-idempotency-key";

const CART_EVENT = "mb-couture-cart-change";
const CHECKOUT_EVENT = "mb-couture-checkout-change";
const IDEMPOTENCY_EVENT = "mb-couture-idempotency-change";

export function cartSnapshot() {
  return typeof window === "undefined"
    ? "{}"
    : window.sessionStorage.getItem(CART_STORAGE_KEY) || "{}";
}

export function checkoutSnapshot() {
  return typeof window === "undefined"
    ? "[]"
    : window.sessionStorage.getItem(CHECKOUT_ITEMS_KEY) || "[]";
}

export function idempotencySnapshot() {
  return typeof window === "undefined"
    ? ""
    : window.sessionStorage.getItem(IDEMPOTENCY_KEY) || "";
}

function subscribe(eventName: string, callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export const subscribeCart = (callback: () => void) =>
  subscribe(CART_EVENT, callback);
export const subscribeCheckout = (callback: () => void) =>
  subscribe(CHECKOUT_EVENT, callback);
export const subscribeIdempotency = (callback: () => void) =>
  subscribe(IDEMPOTENCY_EVENT, callback);

export function writeCart(cart: Record<number, number>) {
  window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function writeCheckoutItems(
  items: Array<{ productId: number; quantity: number; size?: string | null }>
) {
  const next = JSON.stringify(items);
  const previous = checkoutSnapshot();
  if (next !== previous) {
    window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
    window.dispatchEvent(new Event(IDEMPOTENCY_EVENT));
  }
  window.sessionStorage.setItem(CHECKOUT_ITEMS_KEY, next);
  window.dispatchEvent(new Event(CHECKOUT_EVENT));
}

export function ensureIdempotencyKey() {
  let key = idempotencySnapshot();
  if (!key) {
    key = crypto.randomUUID();
    window.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
    window.dispatchEvent(new Event(IDEMPOTENCY_EVENT));
  }
  return key;
}

export function clearAfterSavedOrder() {
  window.sessionStorage.removeItem(CHECKOUT_ITEMS_KEY);
  window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
  writeCart({});
  window.dispatchEvent(new Event(CHECKOUT_EVENT));
  window.dispatchEvent(new Event(IDEMPOTENCY_EVENT));
}
