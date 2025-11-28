const db = require("../db.js");

const DEFAULTS = {
  vatPercent: 15,
  maxDrinks: 10,
  discountTiers: [
    { minOrders: 3, minDrinksPerOrder: 1, percent: 5 },
    { minOrders: 10, minDrinksPerOrder: 2, percent: 10 },
    { minOrders: 20, minDrinksPerOrder: 3, percent: 15 },
  ],
};

async function getConfig() {
  const { rows } = await db.query('SELECT * FROM "Lookup" WHERE type = $1', ['config']);
  const cfg = {};
  for (const r of rows) {
    if (r.value === undefined || r.value === null) continue;
    const parsed = Number(r.value);
    cfg[r.key] = Number.isNaN(parsed) ? r.value : parsed;
  }
  return { ...DEFAULTS, ...cfg };
}

async function calculatePricing(userId, items) {
  const cfg = await getConfig();

  const lookupsRes = await db.query(
    'SELECT * FROM "Lookup" WHERE type = ANY($1::text[]) AND active = true',
    [["flavour", "topping", "consistency"]]
  );
  const lookups = lookupsRes.rows;
  const map = {};
  for (const l of lookups) {
    map[`${l.type}-${l.key}`] = parseFloat(l.value) || 0;
  }

  let subtotal = 0;
  const detailedItems = [];
  for (const it of items) {
    const flavourPrice = map[`flavour-${it.flavour}`] || 50;
    const toppingPrice = map[`topping-${it.topping}`] || 10;
    const consistencyPrice = map[`consistency-${it.consistency}`] || 0;
    const itemPrice = flavourPrice + toppingPrice + consistencyPrice;
    const lineTotal = itemPrice * it.qty;
    subtotal += lineTotal;
    detailedItems.push({ ...it, itemPrice, lineTotal });
  }

  let userOrdersCount = 0;
  if (userId) {
    const countRes = await db.query('SELECT COUNT(*)::int as count FROM "Order" WHERE "userId" = $1', [userId]);
    userOrdersCount = Number(countRes.rows[0]?.count || 0);
  }
  let discountPercent = 0;
  for (const tier of cfg.discountTiers) {
    if (userOrdersCount >= tier.minOrders && items.length >= tier.minDrinksPerOrder) {
      discountPercent = tier.percent;
    }
  }

  const discountAmount = (subtotal * discountPercent) / 100;
  const vatAmount = (subtotal * cfg.vatPercent) / 100;
  const total = subtotal - discountAmount + vatAmount;

  return {
    items: detailedItems,
    subtotal,
    discount: discountAmount,
    discountPercent,
    vat: vatAmount,
    total,
    vatPercent: cfg.vatPercent,
  };
}

module.exports = { calculatePricing };
