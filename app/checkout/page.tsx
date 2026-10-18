"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dresses, ORDER_SIZES } from "../../lib/catalog";
import {
  checkoutSnapshot,
  clearAfterSavedOrder,
  ensureIdempotencyKey,
  idempotencySnapshot,
  subscribeCheckout,
  subscribeIdempotency,
  writeCheckoutItems,
} from "../../lib/checkout-storage";

type CheckoutLine = {
  productId: number;
  quantity: number;
  size?: string | null;
};

const money = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;

export default function CheckoutPage() {
  const router = useRouter();
  const itemsJson = useSyncExternalStore(subscribeCheckout, checkoutSnapshot, () => "[]");
  const items = useMemo(() => {
    try {
      const parsed = JSON.parse(itemsJson) as CheckoutLine[];
      return parsed
        .filter(
          (item) =>
            dresses.some((dress) => dress.id === item.productId) &&
            Number.isInteger(item.quantity) &&
            item.quantity >= 1
        )
        .map((item) => ({ ...item, quantity: Math.min(item.quantity, 20) }));
    } catch {
      return [];
    }
  }, [itemsJson]);
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [configurationError, setConfigurationError] = useState("");
  const idempotencyKey = useSyncExternalStore(
    subscribeIdempotency,
    idempotencySnapshot,
    () => ""
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/checkout-config", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Order setup is incomplete.");
        setDeliveryCharge(data.deliveryCharge);
      })
      .catch((reason: unknown) => {
        setConfigurationError(
          reason instanceof Error ? reason.message : "Order setup is incomplete."
        );
      });
  }, []);

  useEffect(() => {
    if (!idempotencyKey) ensureIdempotencyKey();
  }, [idempotencyKey]);

  const subtotal = useMemo(
    () =>
      items.reduce((total, line) => {
        const dress = dresses.find((item) => item.id === line.productId);
        return total + (dress?.price ?? 0) * line.quantity;
      }, 0),
    [items]
  );
  const total = deliveryCharge === null ? null : subtotal + deliveryCharge;

  function updateItem(productId: number, updates: Partial<CheckoutLine>) {
    writeCheckoutItems(
      items.map((item) =>
        item.productId === productId ? { ...item, ...updates } : item
      )
    );
  }

  function removeItem(productId: number) {
    writeCheckoutItems(items.filter((item) => item.productId !== productId));
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!items.length) {
      setError("Add at least one dress before placing an order.");
      return;
    }
    if (deliveryCharge === null || !idempotencyKey) {
      setError(configurationError || "Order setup is incomplete. Your order was not submitted.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      idempotencyKey,
      customer: {
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        email: form.get("email"),
        address: form.get("address"),
        city: form.get("city"),
        postalCode: form.get("postalCode"),
        instructions: form.get("instructions"),
      },
      items,
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "We could not save your order. Please try again.");
      }

      try {
        clearAfterSavedOrder();
      } catch {
        // The saved order and its confirmation cookie remain authoritative.
      }
      router.replace("/order-confirmation");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not save your order. Your cart is unchanged; please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link className="checkout-brand" href="/">
          <span>MB COUTURE</span>
          <small>THE DESIGNER SHOP</small>
        </Link>
        <span className="checkout-step">SECURE ORDER FORM</span>
      </header>

      <div className="checkout-shell">
        <div className="checkout-title">
          <span className="checkout-eyebrow">COMPLETE YOUR ORDER</span>
          <h1>Delivery Details</h1>
          <p>Review your selected designs and tell us where to deliver them.</p>
        </div>

        {items.length > 0 ? (
          <form className="checkout-grid" onSubmit={placeOrder}>
            <section className="checkout-panel customer-panel">
              <h2>Your Information</h2>
              <div className="field-grid">
                <label>
                  First name <span aria-hidden="true">*</span>
                  <input name="firstName" autoComplete="given-name" required maxLength={80} />
                </label>
                <label>
                  Last name <span aria-hidden="true">*</span>
                  <input name="lastName" autoComplete="family-name" required maxLength={80} />
                </label>
                <label>
                  Phone number <span aria-hidden="true">*</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="03XXXXXXXXX or +923XXXXXXXXX"
                    aria-describedby="phone-help"
                    required
                    maxLength={40}
                  />
                  <small id="phone-help">Pakistani mobile number; spaces and dashes are accepted.</small>
                </label>
                <label>
                  Email address <small>(optional)</small>
                  <input name="email" type="email" autoComplete="email" maxLength={254} />
                </label>
                <label className="field-wide">
                  Complete delivery address <span aria-hidden="true">*</span>
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    required
                    minLength={8}
                    maxLength={500}
                    rows={3}
                  />
                </label>
                <label>
                  City <span aria-hidden="true">*</span>
                  <input name="city" autoComplete="address-level2" required maxLength={100} />
                </label>
                <label>
                  Postal code <small>(optional)</small>
                  <input name="postalCode" autoComplete="postal-code" maxLength={20} />
                </label>
                <label className="field-wide">
                  Additional delivery instructions <small>(optional)</small>
                  <textarea name="instructions" maxLength={500} rows={2} />
                </label>
              </div>
            </section>

            <aside className="checkout-panel order-panel">
              <h2>Your Order</h2>
              <div className="checkout-items">
                {items.map((line) => {
                  const dress = dresses.find((item) => item.id === line.productId)!;
                  return (
                    <article className="checkout-item" key={dress.id}>
                      <Image src={dress.image} alt={dress.name} width={86} height={112} />
                      <div className="checkout-item-details">
                        <strong>{dress.name}</strong>
                        <span>Product ID: {dress.id}</span>
                        <span>{money(dress.price)} each</span>
                        <label className="size-label">
                          Requested size
                          <select
                            value={line.size ?? ""}
                            onChange={(event) =>
                              updateItem(dress.id, { size: event.target.value || null })
                            }
                          >
                            <option value="">No size selected</option>
                            {ORDER_SIZES.map((size) => (
                              <option value={size} key={size}>{size}</option>
                            ))}
                          </select>
                        </label>
                        <small>Size availability will be confirmed by the store.</small>
                        <div className="item-adjustments">
                          <label>
                            Quantity
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={line.quantity}
                              onChange={(event) => {
                                const quantity = Number(event.target.value);
                                if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) {
                                  updateItem(dress.id, { quantity });
                                }
                              }}
                            />
                          </label>
                          <button type="button" className="remove-item" onClick={() => removeItem(dress.id)}>
                            Remove
                          </button>
                        </div>
                        <b>{money(dress.price * line.quantity)}</b>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="order-totals">
                <p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
                <p><span>Delivery</span><strong>{deliveryCharge === null ? "—" : money(deliveryCharge)}</strong></p>
                <p className="final-total"><span>Total</span><strong>{total === null ? "—" : money(total)}</strong></p>
              </div>

              {configurationError && (
                <p className="configuration-error" role="alert">
                  {configurationError} Your order will not be submitted until the store is configured.
                </p>
              )}
              {error && <p className="form-error" role="alert">{error}</p>}

              <button
                className="place-order-button"
                type="submit"
                disabled={submitting || deliveryCharge === null || !idempotencyKey || !items.length}
              >
                {submitting ? "Saving your order…" : "Place Order"}
              </button>
              <p className="order-note">Your order is confirmed only after it has been saved successfully.</p>
              <Link className="back-link" href="/">← Continue shopping</Link>
            </aside>
          </form>
        ) : (
          <section className="checkout-panel empty-checkout">
            <h2>No products selected</h2>
            <p>{error || "Return to the collection to choose a dress."}</p>
            <Link className="place-order-button back-to-shop" href="/">Return to collection</Link>
          </section>
        )}
      </div>

      <style jsx global>{`
        .checkout-page { min-height: 100vh; background: #f8f3eb; color: #4b382b; font-family: Arial, Helvetica, sans-serif; }
        .checkout-header { display:flex; align-items:center; justify-content:space-between; padding:20px 7%; background:#fffdf9; border-bottom:1px solid #e7dccb; }
        .checkout-brand { display:flex; flex-direction:column; gap:5px; color:#4b382b; text-decoration:none; }
        .checkout-brand span { font-family:Georgia,serif; font-size:22px; font-weight:700; letter-spacing:3px; }
        .checkout-brand small,.checkout-step,.checkout-eyebrow { color:#b18a4b; font-size:10px; letter-spacing:2px; }
        .checkout-shell { width:min(1180px,92%); margin:0 auto; padding:52px 0 80px; }
        .checkout-title { margin-bottom:28px; }
        .checkout-eyebrow { font-weight:700; }
        .checkout-title h1 { margin:10px 0; font:400 clamp(32px,4vw,46px) Georgia,serif; }
        .checkout-title p,.order-note,.back-link { color:#827466; font-size:13px; line-height:1.7; }
        .checkout-grid { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr); gap:22px; align-items:start; }
        .checkout-panel { background:#fffdf9; border:1px solid #e7dccb; padding:25px; }
        .checkout-panel h2 { margin:0 0 20px; font:400 24px Georgia,serif; }
        .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:17px; }
        .field-grid label,.size-label,.item-adjustments label { display:flex; flex-direction:column; gap:7px; color:#4b382b; font-size:12px; }
        .field-grid label span { color:#9b5e36; }
        .field-grid label small { color:#827466; font-size:10px; font-weight:400; }
        .field-wide { grid-column:1 / -1; }
        .field-grid input,.field-grid textarea,.checkout-item select,.item-adjustments input { width:100%; border:1px solid #e2d6c6; border-radius:0; background:white; color:#4b382b; padding:12px; font:inherit; }
        .field-grid input:focus,.field-grid textarea:focus,.checkout-item select:focus,.item-adjustments input:focus { outline:2px solid #b18a4b55; border-color:#b18a4b; }
        .field-grid textarea { resize:vertical; }
        .field-grid input[aria-invalid="true"] { border-color:#a13b32; }
        .checkout-items { display:flex; flex-direction:column; }
        .checkout-item { display:grid; grid-template-columns:86px minmax(0,1fr); gap:14px; padding:0 0 17px; margin-bottom:17px; border-bottom:1px solid #e7dccb; }
        .checkout-item img { width:86px; height:112px; object-fit:cover; background:#eee5d9; }
        .checkout-item-details { display:flex; flex-direction:column; align-items:flex-start; gap:6px; min-width:0; font-size:12px; }
        .checkout-item-details strong { font-family:Georgia,serif; font-size:15px; font-weight:400; }
        .checkout-item-details span,.checkout-item-details small { color:#827466; font-size:10px; }
        .size-label { width:100%; margin-top:3px; }
        .checkout-item select { padding:8px; }
        .item-adjustments { width:100%; display:flex; align-items:end; justify-content:space-between; gap:12px; }
        .item-adjustments input { width:76px; padding:7px; }
        .remove-item { border:0; background:transparent; color:#8d4f3e; font-size:11px; text-decoration:underline; cursor:pointer; }
        .checkout-item-details b { margin-top:2px; font-size:13px; }
        .order-totals { padding-top:8px; }
        .order-totals p { display:flex; justify-content:space-between; margin:11px 0; color:#827466; font-size:13px; }
        .order-totals strong { color:#4b382b; }
        .order-totals .final-total { border-top:1px solid #e7dccb; padding-top:15px; margin-top:15px; color:#4b382b; font-size:16px; }
        .configuration-error,.form-error { padding:12px; background:#fff2ee; color:#8e352b; font-size:12px; line-height:1.6; }
        .place-order-button { display:block; width:100%; margin-top:14px; padding:15px; border:1px solid #4b382b; background:#4b382b; color:white; text-align:center; text-decoration:none; font-size:11px; letter-spacing:1.3px; cursor:pointer; }
        .place-order-button:hover:not(:disabled) { background:#b18a4b; border-color:#b18a4b; }
        .place-order-button:disabled { opacity:.55; cursor:not-allowed; }
        .order-note { margin:12px 0; font-size:11px; }
        .back-link { display:inline-block; margin-top:10px; text-decoration:none; }
        .empty-checkout { max-width:560px; margin:0 auto; text-align:center; }
        .empty-checkout p { color:#827466; font-size:13px; line-height:1.7; }
        @media(max-width:800px) { .checkout-grid { grid-template-columns:1fr; } .order-panel { order:-1; } }
        @media(max-width:540px) { .checkout-header { padding:16px 5%; } .checkout-shell { width:92%; padding:35px 0 55px; } .checkout-panel { padding:18px 15px; } .field-grid { grid-template-columns:1fr; } .field-wide { grid-column:auto; } .checkout-step { font-size:8px; letter-spacing:1px; } }
      `}</style>
    </main>
  );
}
