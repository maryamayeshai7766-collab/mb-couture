import { NextResponse } from "next/server";
import { getDatabasePool } from "../../../lib/db";
import { configuredDeliveryCharge } from "../../../lib/order-validation";

export async function GET() {
  try {
    const database = getDatabasePool();
    const table = await database.query<{ orders_table: string | null }>(
      "SELECT to_regclass('public.orders') AS orders_table"
    );
    if (!table.rows[0]?.orders_table) {
      throw new Error("The orders table is not set up.");
    }
    return NextResponse.json(
      { deliveryCharge: configuredDeliveryCharge(), currency: "PKR" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Online ordering needs database and delivery setup before checkout can be submitted." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
