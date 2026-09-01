const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all contact entries (sorted)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET contact by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create contact entry
router.post('/', async (req, res) => {
  try {
    const { type, label, value, icon_class, show_in_nav, show_in_contact, show_in_mobile_menu, sort_order } = req.body;
    if (!type || !label || !value) {
      return res.status(400).json({ error: 'type, label, and value are required' });
    }
    const [result] = await db.query(
      `INSERT INTO contact (type, label, value, icon_class, show_in_nav, show_in_contact, show_in_mobile_menu, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, label, value, icon_class || null, show_in_nav || false, show_in_contact !== false, show_in_mobile_menu || false, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Contact entry created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update contact entry
router.put('/:id', async (req, res) => {
  try {
    const { type, label, value, icon_class, show_in_nav, show_in_contact, show_in_mobile_menu, sort_order } = req.body;
    const [result] = await db.query(
      `UPDATE contact SET type = ?, label = ?, value = ?, icon_class = ?, show_in_nav = ?, show_in_contact = ?, show_in_mobile_menu = ?, sort_order = ?
       WHERE id = ?`,
      [type, label, value, icon_class || null, show_in_nav || false, show_in_contact !== false, show_in_mobile_menu || false, sort_order || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }
    res.json({ message: 'Contact entry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE contact entry — resets auto-increment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact entry not found' });
    }
    // Reorder IDs
    await reorderSimpleTable('contact');
    res.json({ message: 'Contact entry deleted' });
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
