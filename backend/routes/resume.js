const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all resume entries (sorted by section then sort_order)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM resume 
      ORDER BY FIELD(section, 'education', 'work_experience', 'leadership', 'skills', 'research'), sort_order ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET resume entries by section
router.get('/section/:section', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM resume WHERE section = ? ORDER BY sort_order ASC',
      [req.params.section]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single resume entry by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resume WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resume entry not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new resume entry
router.post('/', async (req, res) => {
  try {
    const { section, title, subtitle, date_range, description, button_label, button_url, sort_order } = req.body;
    if (!section || !title) {
      return res.status(400).json({ error: 'section and title are required' });
    }
    const [result] = await db.query(
      `INSERT INTO resume (section, title, subtitle, date_range, description, button_label, button_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [section, title, subtitle || null, date_range || null, description || null, button_label || null, button_url || null, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Resume entry created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update resume entry
router.put('/:id', async (req, res) => {
  try {
    const { section, title, subtitle, date_range, description, button_label, button_url, sort_order } = req.body;
    const [result] = await db.query(
      `UPDATE resume SET section = ?, title = ?, subtitle = ?, date_range = ?, description = ?, button_label = ?, button_url = ?, sort_order = ?
       WHERE id = ?`,
      [section, title, subtitle || null, date_range || null, description || null, button_label || null, button_url || null, sort_order || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resume entry not found' });
    }
    res.json({ message: 'Resume entry updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE resume entry — resets auto-increment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM resume WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resume entry not found' });
    }
    // Reorder IDs
    await reorderSimpleTable('resume');
    res.json({ message: 'Resume entry deleted' });
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
