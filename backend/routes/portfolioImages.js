const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all images for a portfolio item
router.get('/portfolio/:portfolioId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM portfolio_images WHERE portfolio_id = ? ORDER BY sort_order ASC',
      [req.params.portfolioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all images
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM portfolio_images ORDER BY portfolio_id, sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single image by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM portfolio_images WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new image entry
router.post('/', async (req, res) => {
  try {
    const { portfolio_id, image_path, sort_order } = req.body;
    if (!portfolio_id || !image_path) {
      return res.status(400).json({ error: 'portfolio_id and image_path are required' });
    }
    const [result] = await db.query(
      'INSERT INTO portfolio_images (portfolio_id, image_path, sort_order) VALUES (?, ?, ?)',
      [portfolio_id, image_path, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Image added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update image entry
router.put('/:id', async (req, res) => {
  try {
    const { portfolio_id, image_path, sort_order } = req.body;
    const [result] = await db.query(
      'UPDATE portfolio_images SET portfolio_id = ?, image_path = ?, sort_order = ? WHERE id = ?',
      [portfolio_id, image_path, sort_order || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Image updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE image entry
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM portfolio_images WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
