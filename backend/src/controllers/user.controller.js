const db = require("../db.js");

async function getProfile(req, res) {
  try {
    const result = await db.query('SELECT id, name, email, phone, role, "smtpEmail", "smtpPassword" FROM "User" WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, smtpEmail, smtpPassword } = req.body;
    const result = await db.query(
      'UPDATE "User" SET name = $1, phone = $2, "smtpEmail" = $3, "smtpPassword" = $4 WHERE id = $5 RETURNING id, name, email, phone, role, "smtpEmail", "smtpPassword"',
      [name, phone, smtpEmail || null, smtpPassword || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
}

module.exports = { getProfile, updateProfile };
