import "server-only";
import { dresses, ORDER_SIZES } from "./catalog";

type CustomerInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  instructions: string;
};

type ItemInput = {
  productId: number;
  quantity: number;
  size?: string | null;
};

export type ValidatedOrder = {
  idempotencyKey: string;
  customer: CustomerInput;
  items: Array<{
    productId: number;
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    size: string | null;
    lineTotal: number;
  }>;
  subtotal: number;
};

export function configuredDeliveryCharge() {
  const raw = process.env.DELIVERY_CHARGE_PKR;
  if (raw === undefined || !/^\d+$/.test(raw)) {
    throw new Error("DELIVERY_CHARGE_PKR is not configured.");
  }
  const charge = Number(raw);
  if (!Number.isSafeInteger(charge)) {
    throw new Error("DELIVERY_CHARGE_PKR must be a safe integer.");
  }
  return charge;
}

function requiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const clean = value.trim();
  if (!clean || clean.length > maxLength) {
    throw new Error(`${label} is required and must be under ${maxLength} characters.`);
  }
  return clean;
}

function optionalText(value: unknown, label: string, maxLength: number) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new Error(`${label} must be under ${maxLength} characters.`);
  }
  return value.trim();
}

export function validateOrderInput(input: unknown): ValidatedOrder {
  if (!input || typeof input !== "object") {
    throw new Error("Please provide your order details.");
  }
  const body = input as Record<string, unknown>;
  const customerInput = body.customer as Record<string, unknown> | undefined;
  if (!customerInput || typeof customerInput !== "object") {
    throw new Error("Please complete your customer details.");
  }

  const firstName = requiredText(customerInput.firstName, "First name", 80);
  const lastName = requiredText(customerInput.lastName, "Last name", 80);
  const rawPhone = requiredText(customerInput.phone, "Phone number", 40);
  const compactPhone = rawPhone.replace(/[\s()-]/g, "");
  const phoneMatch = compactPhone.match(
    /^(?:\+92|0092|92|0)?(3\d{9})$/
  );
  if (!phoneMatch) {
    throw new Error("Enter a valid Pakistani mobile number, such as 03XXXXXXXXX or +923XXXXXXXXX.");
  }
  const phone = `+92${phoneMatch[1]}`;

  const email = optionalText(customerInput.email, "Email address", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const address = requiredText(customerInput.address, "Delivery address", 500);
  const city = requiredText(customerInput.city, "City", 100);
  const postalCode = optionalText(customerInput.postalCode, "Postal code", 20);
  const instructions = optionalText(
    customerInput.instructions,
    "Delivery instructions",
    500
  );

  if (
    typeof body.idempotencyKey !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.idempotencyKey
    )
  ) {
    throw new Error("Your checkout session expired. Please refresh and try again.");
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 44) {
    throw new Error("Your order must contain at least one product.");
  }

  const usedProductIds = new Set<number>();
  const items = (body.items as ItemInput[]).map((item) => {
    if (!item || !Number.isInteger(item.productId)) {
      throw new Error("An order item is invalid. Please refresh checkout.");
    }
    const product = dresses.find((dress) => dress.id === item.productId);
    if (!product || usedProductIds.has(item.productId)) {
      throw new Error("An order contains an invalid or duplicate product.");
    }
    usedProductIds.add(item.productId);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      throw new Error("Choose a quantity between 1 and 20 for each product.");
    }
    const size = item.size || null;
    if (size !== null && !ORDER_SIZES.includes(size as (typeof ORDER_SIZES)[number])) {
      throw new Error("Choose a listed size or leave it blank.");
    }
    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: item.quantity,
      size,
      lineTotal: product.price * item.quantity,
    };
  });

  return {
    idempotencyKey: body.idempotencyKey,
    customer: {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      postalCode,
      instructions,
    },
    items,
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
  };
}
