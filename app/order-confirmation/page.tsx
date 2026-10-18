import { cookies } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDatabasePool } from "../../lib/db";
import { ORDER_CONFIRMATION_COOKIE, verifySignedToken } from "../../lib/security";

export const metadata = { robots: { index: false, follow: false } };

type ConfirmationOrder = {
  order_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  delivery_address: string;
  city: string;
  postal_code: string | null;
  delivery_instructions: string | null;
  items: Array<{
    productId: number;
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    size: string | null;
    lineTotal: number;
  }>;
  subtotal_pkr: number;
  delivery_charge_pkr: number;
  total_pkr: number;
  status: string;
  created_at: Date;
};

const money = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<main className="confirmation-page">Loading order confirmation…</main>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

async function OrderConfirmationContent() {
  const jar = await cookies();
  const token = jar.get(ORDER_CONFIRMATION_COOKIE)?.value;
  const orderId = verifySignedToken(token, "order");

  let order: ConfirmationOrder | null = null;
  if (orderId) {
    try {
      const pool = getDatabasePool();
      const result = await pool.query<ConfirmationOrder>(
        `SELECT order_number, first_name, last_name, phone, email,
          delivery_address, city, postal_code, delivery_instructions, items,
          subtotal_pkr, delivery_charge_pkr, total_pkr, status, created_at
         FROM orders WHERE id = $1`,
        [orderId]
      );
      order = result.rows[0] ?? null;
    } catch {
      order = null;
    }
  }

  return (
    <main className="confirmation-page">
      {order ? (
        <article className="confirmation-card">
          <span className="confirmation-mark" aria-hidden="true">âœ“</span>
          <p className="confirmation-eyebrow">MB COUTURE ORDER</p>
          <h1>Thank you for your order.</h1>
          <p className="confirmation-copy">Your order has been saved. Our team will contact you to confirm availability and delivery.</p>
          <div className="order-number-box">
            <span>Order number</span>
            <strong>{order.order_number}</strong>
            <small>Status: {order.status}</small>
          </div>

          <section className="confirmation-section">
            <h2>Order details</h2>
            {order.items.map((item) => (
              <div className="confirmation-item" key={item.productId}>
                <Image src={item.image} alt={item.name} width={60} height={78} />
                <div>
                  <strong>{item.name}</strong>
                  <span>Product ID: {item.productId}{item.size ? ` Â· Requested size ${item.size}` : ""}</span>
                  <span>Quantity: {item.quantity} Ã— {money(item.unitPrice)}</span>
                </div>
                <b>{money(item.lineTotal)}</b>
              </div>
            ))}
            <p><span>Subtotal</span><strong>{money(order.subtotal_pkr)}</strong></p>
            <p><span>Delivery</span><strong>{money(order.delivery_charge_pkr)}</strong></p>
            <p className="confirmation-total"><span>Total</span><strong>{money(order.total_pkr)}</strong></p>
          </section>

          <section className="confirmation-section address-section">
            <h2>Delivery address</h2>
            <p>{order.first_name} {order.last_name}</p>
            <p>{order.delivery_address}</p>
            <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ""}</p>
            <p>{order.phone}{order.email ? ` Â· ${order.email}` : ""}</p>
            {order.delivery_instructions && <p>Instructions: {order.delivery_instructions}</p>}
          </section>

          <Link className="confirmation-home" href="/">Return to MB COUTURE</Link>
        </article>
      ) : (
        <article className="confirmation-card">
          <p className="confirmation-eyebrow">MB COUTURE</p>
          <h1>Confirmation unavailable</h1>
          <p className="confirmation-copy">This private confirmation is available in the browser where the order was placed. If you did not receive an order number, the order may not have been saved.</p>
          <Link className="confirmation-home" href="/">Return to MB COUTURE</Link>
        </article>
      )}


    </main>
  );
}
