import { cookies } from "next/headers";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getDatabasePool } from "../../../lib/db";
import { ADMIN_SESSION_COOKIE, verifySignedToken } from "../../../lib/security";
import AdminLogoutButton from "../logout-button";

export const metadata = { robots: { index: false, follow: false } };

type OrderRow = {
  id: string;
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<main className="admin-orders-page">Loading orders…</main>}>
      <AdminOrdersContent />
    </Suspense>
  );
}

async function AdminOrdersContent() {
  const jar = await cookies();
  if (!verifySignedToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin")) {
    redirect("/admin/login");
  }

  let orders: OrderRow[] = [];
  let unavailable = false;
  try {
    const pool = getDatabasePool();
    const result = await pool.query<OrderRow>(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 200"
    );
    orders = result.rows;
  } catch {
    unavailable = true;
  }

  return (
    <main className="admin-orders-page">
      <header className="admin-orders-header">
        <div>
          <span>MB COUTURE</span>
          <h1>Customer orders</h1>
        </div>
        <AdminLogoutButton />
      </header>
      <div className="admin-orders-content">
        {unavailable ? (
          <p className="admin-orders-notice">Order storage is unavailable. Check the database connection and orders table setup.</p>
        ) : orders.length === 0 ? (
          <p className="admin-orders-notice">No orders have been placed yet.</p>
        ) : orders.map((order) => (
          <article className="admin-order-card" key={order.id}>
            <header className="admin-order-heading">
              <div><h2>{order.order_number}</h2><p>{new Date(order.created_at).toLocaleString()}</p></div>
              <span className="admin-order-status">{order.status}</span>
            </header>
            <section className="admin-order-customer">
              <h3>Customer and delivery</h3>
              <p><strong>{order.first_name} {order.last_name}</strong></p>
              <p>{order.phone}{order.email ? ` Â· ${order.email}` : ""}</p>
              <p>{order.delivery_address}</p>
              <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ""}</p>
              {order.delivery_instructions && <p>Instructions: {order.delivery_instructions}</p>}
            </section>
            <section className="admin-order-items">
              <h3>Items</h3>
              {order.items.map((item) => (
                <div className="admin-order-item" key={item.productId}>
                  <Image src={item.image} alt="" width={48} height={60} />
                  <span>{item.name} Â· ID {item.productId}{item.size ? ` Â· ${item.size}` : ""} Â· Qty {item.quantity}</span>
                  <strong>{money(item.lineTotal)}</strong>
                </div>
              ))}
            </section>
            <footer className="admin-order-total">
              <span>Subtotal {money(order.subtotal_pkr)} Â· Delivery {money(order.delivery_charge_pkr)}</span>
              <strong>Total {money(order.total_pkr)}</strong>
            </footer>
          </article>
        ))}
      </div>

    </main>
  );
}
