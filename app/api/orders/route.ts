import { randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Pool, PoolClient } from "pg";
import { getDatabasePool } from "../../../lib/db";
import { validateOrderInput, configuredDeliveryCharge } from "../../../lib/order-validation";
import {
  createSignedToken,
  ORDER_CONFIRMATION_COOKIE,
} from "../../../lib/security";

type SavedOrder = {
  id: string;
  order_number: string;
};

export async function POST(request: NextRequest) {
  let order;
  try {
    order = validateOrderInput(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check your order details." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let deliveryCharge: number;
  try {
    deliveryCharge = configuredDeliveryCharge();
    // Check signing configuration before saving, so a saved order can always be confirmed.
    createSignedToken("order", "configuration-check", 60);
  } catch {
    return NextResponse.json(
      { error: "Online ordering is not fully configured. Please contact the store." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let pool: Pool;
  try {
    pool = getDatabasePool();
  } catch {
    return NextResponse.json(
      { error: "Order storage is not configured yet. Your order was not submitted." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const client: PoolClient | null = await pool.connect().catch(() => null);
  if (!client) {
    return NextResponse.json(
      { error: "We could not reach order storage. Your order was not submitted." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let savedOrder: SavedOrder | undefined;
  let isExistingOrder = false;
  try {
    await client.query("BEGIN");
    const existing = await client.query<SavedOrder>(
      "SELECT id, order_number FROM orders WHERE idempotency_key = $1",
      [order.idempotencyKey]
    );

    if (existing.rows[0]) {
      savedOrder = existing.rows[0];
      isExistingOrder = true;
    } else {
      const orderId = randomUUID();
      const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
      const orderNumber = `MB-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
      const total = order.subtotal + deliveryCharge;
      const inserted = await client.query<SavedOrder>(
        `INSERT INTO orders (
          id, order_number, idempotency_key, first_name, last_name, phone,
          email, delivery_address, city, postal_code, delivery_instructions,
          items, subtotal_pkr, delivery_charge_pkr, total_pkr
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12::jsonb, $13, $14, $15
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id, order_number`,
        [
          orderId,
          orderNumber,
          order.idempotencyKey,
          order.customer.firstName,
          order.customer.lastName,
          order.customer.phone,
          order.customer.email || null,
          order.customer.address,
          order.customer.city,
          order.customer.postalCode || null,
          order.customer.instructions || null,
          JSON.stringify(order.items),
          order.subtotal,
          deliveryCharge,
          total,
        ]
      );
      savedOrder = inserted.rows[0];

      // A simultaneous retry can win the unique idempotency key race.
      if (!savedOrder) {
        const raced = await client.query<SavedOrder>(
          "SELECT id, order_number FROM orders WHERE idempotency_key = $1",
          [order.idempotencyKey]
        );
        savedOrder = raced.rows[0];
        isExistingOrder = true;
      }
      if (!savedOrder) throw new Error("The order was not inserted.");
    }

    await client.query("COMMIT");
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json(
      { error: "We could not save your order. Your cart is unchanged; please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    client.release();
  }

  const response = NextResponse.json(
    { success: true, orderNumber: savedOrder.order_number },
    {
      status: isExistingOrder ? 200 : 201,
      headers: { "Cache-Control": "no-store" },
    }
  );
  response.cookies.set(
    ORDER_CONFIRMATION_COOKIE,
    createSignedToken("order", savedOrder.id, 60 * 60),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/order-confirmation",
      maxAge: 60 * 60,
    }
  );
  return response;
}
