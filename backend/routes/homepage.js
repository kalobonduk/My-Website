const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all homepage content
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM homepage ORDER BY section ASC, sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET homepage content by section
router.get('/section/:section', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM homepage WHERE section = ? ORDER BY sort_order ASC',
      [req.params.section]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single entry by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM homepage WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new entry
router.post('/', async (req, res) => {
  try {
    const { section, content_key, content_value, content_type, sort_order } = req.body;
    if (!section || !content_key) {
      return res.status(400).json({ error: 'section and content_key are required' });
    }
    const [result] = await db.query(
      'INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES (?, ?, ?, ?, ?)',
      [section, content_key, content_value || '', content_type || 'text', sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Entry created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update entry
router.put('/:id', async (req, res) => {
  try {
    const { section, content_key, content_value, content_type, sort_order } = req.body;
    const [result] = await db.query(
      'UPDATE homepage SET section = ?, content_key = ?, content_value = ?, content_type = ?, sort_order = ? WHERE id = ?',
      [section, content_key, content_value || '', content_type || 'text', sort_order || 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Entry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM homepage WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    // Reorder IDs
    await reorderSimpleTable('homepage');
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function reorderSimpleTable(tableName) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(`SELECT id FROM ${tableName} ORDER BY id ASC`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (let i = 0; i < rows.length; i++) {
      const newId = i + 1;
      if (rows[i].id !== newId) {
        await conn.query(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [newId, rows[i].id]);
      }
    }
    await conn.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = ${rows.length + 1}`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = router;
