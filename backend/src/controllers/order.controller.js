const db = require("../db.js");
const { calculatePricing } = require("../services/pricing.service.js");
const { sendOrderEmail } = require("../services/email.service.js");

async function createOrder(req, res) {
  try {
    const { items, restaurant, pickupAt, makePayment, paymentMethodId } = req.body;
    const userId = req.user.id;

    const pricing = await calculatePricing(userId, items);

    const initialStatus = makePayment && paymentMethodId ? 'PAID' : 'PENDING';

    const result = await db.query(
      `INSERT INTO "Order" ("userId", total, "vatAmount", discount, restaurant, "pickupAt", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, pricing.total, pricing.vat, pricing.discount, restaurant, new Date(pickupAt), initialStatus]
    );
    const order = result.rows[0];

    for (const item of pricing.items) {
      await db.query(
        `INSERT INTO "OrderItem" ("orderId", flavour, topping, consistency, qty, "individuallyPriced")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.flavour, item.topping, item.consistency, item.qty, item.itemPrice / (item.qty || 1)]
      );
    }

    const userResult = await db.query('SELECT email, name, "smtpEmail", "smtpPassword" FROM "User" WHERE id = $1', [userId]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      if (user.email) {
        try {
          await sendOrderEmail(user.email, { id: order.id, items: pricing.items, subtotal: pricing.subtotal, discount: pricing.discount, vat: pricing.vat, total: pricing.total, pickupAt, restaurant, customerName: user.name }, user.smtpEmail, user.smtpPassword);
        } catch (emailErr) {
          console.error('Failed to send order email:', emailErr.message);
        }
      }
    }

    res.json({ success: true, order, pricing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
}

async function getMyOrders(req, res) {
  try {
    const result = await db.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'flavour', oi.flavour, 'topping', oi.topping,
        'consistency', oi.consistency, 'qty', oi.qty, 'individuallyPriced', oi."individuallyPriced"
      )) as items
       FROM "Order" o
       LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
       WHERE o."userId" = $1
       GROUP BY o.id
       ORDER BY o."createdAt" DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
}

async function getOrder(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await db.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'flavour', oi.flavour, 'topping', oi.topping,
        'consistency', oi.consistency, 'qty', oi.qty
      )) as items
       FROM "Order" o
       LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });
    
    const order = result.rows[0];
    if (req.user.role !== "MANAGER" && order.userId !== req.user.id) 
      return res.status(403).json({ message: "Forbidden" });
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching order" });
  }
}

module.exports = { createOrder, getMyOrders, getOrder };

async function previewOrder(req, res) {
  try {
    const { items } = req.body;
    const userId = req.user?.id || null;

    const pricing = await calculatePricing(userId, items);
    return res.json({ success: true, pricing });
  } catch (err) {
    console.error('Error generating preview', err);
    res.status(500).json({ message: 'Error generating price preview' });
  }
}

async function confirmOrder(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const oRes = await db.query('SELECT * FROM "Order" WHERE id = $1', [id]);
    if (oRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    const order = oRes.rows[0];

    if (req.user.role !== 'MANAGER' && order.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await db.query('UPDATE "Order" SET status = $1 WHERE id = $2', ['PAID', id]);

    const itemsRes = await db.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [id]);
    const userRes = await db.query('SELECT email, name, "smtpEmail", "smtpPassword" FROM "User" WHERE id = $1', [order.userId]);

    const email = userRes.rows[0]?.email;
    const name = userRes.rows[0]?.name;
    const smtpEmail = userRes.rows[0]?.smtpEmail;
    const smtpPassword = userRes.rows[0]?.smtpPassword;

    if (email) {
      try {
        await sendOrderEmail(email, { id: order.id, items: itemsRes.rows, subtotal: order.total - order.discount - order.vatAmount, discount: order.discount, vat: order.vatAmount, total: order.total, pickupAt: order.pickupAt, restaurant: order.restaurant, customerName: name }, smtpEmail, smtpPassword);
      } catch (emailErr) {
        console.error('Failed to send receipt email:', emailErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('confirmOrder error', err);
    res.status(500).json({ message: 'Error confirming payment' });
  }
}

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const orderRes = await db.query('SELECT * FROM "Order" WHERE id = $1 AND "userId" = $2', [orderId, userId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRes.rows[0];
    if (order.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    await db.query('UPDATE "Order" SET status = $1 WHERE id = $2', ['CANCELLED', orderId]);

    const itemsRes = await db.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [orderId]);
    const userRes = await db.query('SELECT email, name, "smtpEmail", "smtpPassword" FROM "User" WHERE id = $1', [userId]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (user.email) {
        try {
          await sendOrderEmail(user.email, { 
            id: order.id,
            items: itemsRes.rows,
            subtotal: order.total - order.discount - order.vatAmount, 
            discount: order.discount, 
            vat: order.vatAmount, 
            total: order.total, 
            pickupAt: order.pickupAt, 
            restaurant: order.restaurant, 
            customerName: user.name,
            cancelled: true
          }, user.smtpEmail, user.smtpPassword);
        } catch (emailErr) {
          console.error('Failed to send cancellation email:', emailErr.message);
        }
      }
    }

    res.json({ success: true, message: 'Order cancelled successfully. Refund will be processed.' });
  } catch (err) {
    console.error('cancelOrder error', err);
    res.status(500).json({ message: 'Error cancelling order' });
  }
}

module.exports = { createOrder, getMyOrders, getOrder, previewOrder, confirmOrder, cancelOrder };
