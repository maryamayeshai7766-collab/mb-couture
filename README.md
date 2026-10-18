# MB COUTURE

Existing Next.js storefront for the MB COUTURE Eastern-wear catalogue.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Order database and owner access

Online order saving needs PostgreSQL. Create a managed PostgreSQL database with a provider such as Neon or Supabase, then run [`db/orders.sql`](db/orders.sql) once in that database's SQL editor.

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL`: the private PostgreSQL connection string.
- `DELIVERY_CHARGE_PKR`: the store's flat delivery charge in PKR. Enter `0` only if delivery is free; the app does not assume a shipping fee.
- `ADMIN_PASSWORD`: a long password for owner sign-in.
- `SESSION_SECRET`: a random secret with at least 32 characters for signed owner and confirmation cookies.

Generate a suitable session secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Keep `.env.local` private. Add these values to the Vercel project's Environment Variables for the environments you use. Do not add a `NEXT_PUBLIC_` prefix to secrets.

Customers submit orders at `/checkout`. A saved order has a private `/order-confirmation` page protected by a short-lived HTTP-only cookie; customer details are not put in the URL. The owner signs in at `/admin/login` and views customer orders at `/admin/orders`.

The API validates product IDs, names, images and prices against `lib/catalog.ts`, calculates totals on the server, and records orders as `Pending`. A unique idempotency key prevents duplicate saves on retries. Requested sizes are subject to store confirmation; the app does not claim stock availability.

The `Unstitched` category is available but has no products assigned because the current photos show modeled garments and do not establish unstitched status.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```
