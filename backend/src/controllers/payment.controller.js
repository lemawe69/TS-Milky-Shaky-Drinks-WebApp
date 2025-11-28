const db = require('../db.js')

async function listPaymentMethods(req, res) {
  try {
    const userId = req.user.id
    const { rows } = await db.query('SELECT id, "cardholderName", brand, last4, "expiryMonth", "expiryYear", active, "createdAt" FROM "PaymentMethod" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userId])
    res.json(rows)
  } catch (err) {
    console.error('listPaymentMethods error', err)
    res.status(500).json({ message: 'Error fetching payment methods' })
  }
}

async function addPaymentMethod(req, res) {
  try {
    const userId = req.user.id
    const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv, brand = null } = req.body

   
    if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ message: 'Missing required card fields' })
    }

    const last4 = cardNumber.slice(-4)

    const { rows } = await db.query(
      'INSERT INTO "PaymentMethod" ("userId", provider, "cardholderName", "cardNumber", "expiryMonth", "expiryYear", cvv, brand, last4, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, "cardholderName", brand, last4, "expiryMonth", "expiryYear", active, "createdAt"',
      [userId, 'card', cardholderName, cardNumber, expiryMonth, expiryYear, cvv, brand, last4, true]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('addPaymentMethod error', err)
    res.status(500).json({ message: 'Error creating payment method' })
  }
}

async function deletePaymentMethod(req, res) {
  try {
    const userId = req.user.id
    const id = Number(req.params.id)
    const result = await db.query('DELETE FROM "PaymentMethod" WHERE id = $1 AND "userId" = $2 RETURNING id', [id, userId])
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('deletePaymentMethod error', err)
    res.status(500).json({ message: 'Error deleting payment method' })
  }
}

module.exports = { listPaymentMethods, addPaymentMethod, deletePaymentMethod }
