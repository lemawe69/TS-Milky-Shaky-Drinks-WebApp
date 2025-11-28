const db = require("../db.js");

async function listLookups(req, res) {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM "Lookup" WHERE active = true';
    const params = [];
    if (type) {
      query += " AND type = $1";
      params.push(type);
    }
    query += " ORDER BY id ASC";
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lookups" });
  }
}

async function createLookup(req, res) {
  try {
    const { type, key, value, active } = req.body;
    const result = await db.query(
      'INSERT INTO "Lookup" (type, key, value, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [type, key, value, active !== false]
    );
    
    await db.query(
      'INSERT INTO "Audit" ("actorId","tableName","recordId","action","changes") VALUES ($1, $2, $3, $4, $5)',
      [req.user?.id || null, 'Lookup', result.rows[0].id, 'CREATE', JSON.stringify(result.rows[0])]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating lookup" });
  }
}

async function updateLookup(req, res) {
  try {
    const id = Number(req.params.id);
    
    const oldResult = await db.query('SELECT * FROM "Lookup" WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ message: "Not found" });
    
    const result = await db.query(
      'UPDATE "Lookup" SET type = $1, key = $2, value = $3, active = $4 WHERE id = $5 RETURNING *',
      [req.body.type, req.body.key, req.body.value, req.body.active, id]
    );
    
    await db.query(
      'INSERT INTO "Audit" ("actorId","tableName","recordId","action","changes") VALUES ($1, $2, $3, $4, $5)',
      [req.user?.id || null, 'Lookup', id, 'UPDATE', JSON.stringify({ old: oldResult.rows[0], new: result.rows[0] })]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating lookup" });
  }
}

async function deleteLookup(req, res) {
  try {
    const id = Number(req.params.id);
    
    const oldResult = await db.query('SELECT * FROM "Lookup" WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ message: "Not found" });
    
    await db.query('DELETE FROM "Lookup" WHERE id = $1', [id]);
    
    await db.query(
      'INSERT INTO "Audit" ("actorId","tableName","recordId","action","changes") VALUES ($1, $2, $3, $4, $5)',
      [req.user?.id || null, 'Lookup', id, 'DELETE', JSON.stringify(oldResult.rows[0])]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting lookup" });
  }
}

module.exports = { listLookups, createLookup, updateLookup, deleteLookup };
