# Milky Shaky Drinks - Order Milkshake for Pickup

A fully functional web application for ordering custom milkshakes online with pickup at your nearest location. Built with React, Node.js and PostgreSQL.

# Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn

# Run Frontend and backend with:
npm run dev
Open: http://localhost:5173

# Test Credentials
- Email: manager@milkyshaky.com
- Password: manager123

# Database Setup:

## Create Database
CREATE DATABASE milkshake;

## Create ENUM types
CREATE TYPE "Role" AS ENUM ('PATRON', 'MANAGER');
CREATE TYPE "Status" AS ENUM ('PENDING', 'PAID', 'READY', 'COMPLETED', 'CANCELLED');

## Create User table
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "phone" VARCHAR(20),
  "role" "Role" NOT NULL DEFAULT 'PATRON',
  "password" TEXT NOT NULL
);

## Create Order table
CREATE TABLE "Order" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "total" DOUBLE PRECISION NOT NULL,
  "vatAmount" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL,
  "status" "Status" NOT NULL DEFAULT 'PENDING',
  "restaurant" VARCHAR(255) NOT NULL,
  "pickupAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

## Create OrderItem table
CREATE TABLE "OrderItem" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "flavour" VARCHAR(255) NOT NULL,
  "topping" VARCHAR(255) NOT NULL,
  "consistency" VARCHAR(255) NOT NULL,
  "qty" INTEGER NOT NULL,
  "individuallyPriced" DOUBLE PRECISION NOT NULL
);

## Create Lookup table
CREATE TABLE "Lookup" (
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(255) NOT NULL,
  "key" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

## Create Audit table
CREATE TABLE "Audit" (
  "id" SERIAL PRIMARY KEY,
  "actorId" INTEGER REFERENCES "User"("id") ON DELETE SET NULL,
  "tableName" VARCHAR(255) NOT NULL,
  "recordId" INTEGER,
  "action" VARCHAR(50) NOT NULL,
  "changes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

## Create Indexes for better query performance
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_order_userId" ON "Order"("userId");
CREATE INDEX "idx_order_createdAt" ON "Order"("createdAt");
CREATE INDEX "idx_orderitem_orderId" ON "OrderItem"("orderId");
CREATE INDEX "idx_lookup_type" ON "Lookup"("type");
CREATE INDEX "idx_lookup_active" ON "Lookup"("active");
CREATE INDEX "idx_audit_tableName" ON "Audit"("tableName");
CREATE INDEX "idx_audit_createdAt" ON "Audit"("createdAt");

# Sample Data
## Insert lookups (flavours)
INSERT INTO "Lookup" ("type","key","value","active") VALUES
  ('flavour', 'Strawberry', '60', true),
  ('flavour', 'Vanilla', '50', true),
  ('flavour', 'Chocolate', '55', true),
  ('flavour', 'Coffee', '55', true),
  ('flavour', 'Banana', '50', true),
  ('flavour', 'Oreo', '65', true),
  ('flavour', 'BarOne', '65', true);

## Insert lookups (toppings)
INSERT INTO "Lookup" ("type","key","value","active") VALUES
  ('topping', 'Frozen Strawberries', '15', true),
  ('topping', 'Freeze-dried Banana', '15', true),
  ('topping', 'Oreo crumbs', '12', true),
  ('topping', 'BarOne syrup', '20', true),
  ('topping', 'Coffee powder with chocolate', '18', true),
  ('topping', 'Chocolate vermicelli', '10', true);

## Insert lookups (consistency)
INSERT INTO "Lookup" ("type","key","value","active") VALUES
  ('consistency', 'Double thick', '15', true),
  ('consistency', 'Thick', '10', true),
  ('consistency', 'Milky', '5', true),
  ('consistency', 'Icy', '0', true);

## Configuration values
INSERT INTO "Lookup" ("type","key","value","active") VALUES
  ('config', 'VAT_PERCENT', '15', true),
  ('config', 'MAX_DRINKS_PER_ORDER', '10', true);


## Manager account
INSERT INTO "User" ("name","email","password","phone","role") VALUES
  ('Manager', 'manager@milkyshaky.com', crypt('manager123', gen_salt('bf', 10)), '012 345 6789', 'MANAGER')
  ON CONFLICT ("email") DO NOTHING;

## Patron (customer)
INSERT INTO "User" ("name","email","password","phone","role") VALUES
  ('Test Customer', 'patron@milkyshaky.com', crypt('patron123', gen_salt('bf', 10)), '098 765 4321', 'PATRON')
  ON CONFLICT ("email") DO NOTHING;
