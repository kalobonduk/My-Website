const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all messages (newest first)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single message by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new message (from contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const [result] = await db.query(
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(201).json({ id: result.insertId, message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update message (e.g., mark as read)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, message, is_read } = req.body;
    const [result] = await db.query(
      'UPDATE messages SET name = ?, email = ?, message = ?, is_read = ? WHERE id = ?',
      [name, email, message, is_read || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE messages SET is_read = 1 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE message — resets auto-increment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    // Reorder IDs
    await reorderSimpleTable('messages');
    res.json({ message: 'Message deleted' });
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
