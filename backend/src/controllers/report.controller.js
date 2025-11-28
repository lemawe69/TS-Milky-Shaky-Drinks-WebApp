const pool = require("../db.js");

async function ordersPerPeriod(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const toDate = to ? new Date(to) : new Date();
  const sql = `SELECT DATE("createdAt") as day, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM "Order" WHERE "createdAt" BETWEEN $1 AND $2 GROUP BY DATE("createdAt") ORDER BY DATE("createdAt")`;
  const result = await pool.query(sql, [fromDate, toDate]);
  res.json(result.rows);
}

async function topFlavours(req, res) {
  const sql = `SELECT "flavour", SUM(qty) as volume FROM "OrderItem" GROUP BY "flavour" ORDER BY SUM(qty) DESC LIMIT 10`;
  const result = await pool.query(sql);
  res.json(result.rows);
}

async function customerVolumes(req, res) {
  const sql = `SELECT u.id, u.name, COUNT(o.id) as orders, COALESCE(SUM(o.total), 0) as total_spent FROM "User" u LEFT JOIN "Order" o ON o."userId" = u.id GROUP BY u.id HAVING COUNT(o.id) > 0 ORDER BY SUM(o.total) DESC LIMIT 100`;
  const result = await pool.query(sql);
  res.json(result.rows);
}

async function orderStats(req, res) {
  const sql = `SELECT COALESCE(MIN(total), 0) as min_order, COALESCE(MAX(total), 0) as max_order FROM "Order"`;
  const result = await pool.query(sql);
  res.json(result.rows[0] || { min_order: 0, max_order: 0 });
}

async function auditTrail(req, res) {
  const sql = `SELECT * FROM "Audit" ORDER BY "createdAt" DESC LIMIT 200`;
  const result = await pool.query(sql);
  res.json(result.rows);
}

async function weeklyStats(req, res) {
  const sql = `SELECT 
    TO_CHAR(DATE_TRUNC('week', "createdAt"), 'YYYY-MM-DD') as week,
    COUNT(*) as orders,
    COALESCE(SUM(total), 0) as revenue
  FROM "Order"
  WHERE "createdAt" >= NOW() - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', "createdAt")
  ORDER BY DATE_TRUNC('week', "createdAt")`;
  const result = await pool.query(sql);
  res.json(result.rows);
}

async function monthlyStats(req, res) {
  const sql = `SELECT 
    TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
    COUNT(*) as orders,
    COALESCE(SUM(total), 0) as revenue
  FROM "Order"
  WHERE "createdAt" >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', "createdAt")
  ORDER BY DATE_TRUNC('month', "createdAt")`;
  const result = await pool.query(sql);
  res.json(result.rows);
}

module.exports = { ordersPerPeriod, topFlavours, customerVolumes, orderStats, auditTrail, weeklyStats, monthlyStats };
