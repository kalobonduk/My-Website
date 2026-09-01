const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all portfolio items (sorted)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM portfolio ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single portfolio item by id (with images)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM portfolio WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    // Also fetch associated images
    const [images] = await db.query(
      'SELECT * FROM portfolio_images WHERE portfolio_id = ? ORDER BY sort_order ASC',
      [req.params.id]
    );
    res.json({ ...rows[0], images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new portfolio item (auto-generates project_page_url)
router.post('/', async (req, res) => {
  try {
    const { title, category, description, skills, project_page_url, image_type, detail_description, detail_skills, has_video, video_url, sort_order } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO portfolio (title, category, description, skills, project_page_url, image_type, detail_description, detail_skills, has_video, video_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, description, skills, project_page_url || null, image_type || 'none', detail_description, detail_skills, has_video || false, video_url || null, sort_order || 0]
    );

    // Auto-set project_page_url to /project/{id} if not provided
    const newId = result.insertId;
    if (!project_page_url) {
      await db.query('UPDATE portfolio SET project_page_url = ? WHERE id = ?', [`/project/${newId}`, newId]);
    }

    res.status(201).json({ id: newId, message: 'Portfolio item created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update portfolio item
router.put('/:id', async (req, res) => {
  try {
    const { title, category, description, skills, project_page_url, image_type, detail_description, detail_skills, has_video, video_url, sort_order } = req.body;
    
    // Auto-generate URL if not provided
    const url = project_page_url || `/project/${req.params.id}`;

    const [result] = await db.query(
      `UPDATE portfolio SET title = ?, category = ?, description = ?, skills = ?, project_page_url = ?, image_type = ?, detail_description = ?, detail_skills = ?, has_video = ?, video_url = ?, sort_order = ?
       WHERE id = ?`,
      [title, category, description, skills, url, image_type || 'none', detail_description, detail_skills, has_video || false, video_url || null, sort_order || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    res.json({ message: 'Portfolio item updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE portfolio item — resets auto-increment and re-orders IDs
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    // Re-order IDs to fill gaps
    await reorderTable('portfolio', 'portfolio_images', 'portfolio_id');

    res.json({ message: 'Portfolio item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Re-order IDs after deletion to avoid gaps
async function reorderTable(tableName, childTable, foreignKey) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get all rows ordered by current sort_order then id
    const [rows] = await conn.query(`SELECT id FROM ${tableName} ORDER BY sort_order ASC, id ASC`);
    
    // Temporarily disable FK checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Update each row to its new sequential ID
    for (let i = 0; i < rows.length; i++) {
      const newId = i + 1;
      const oldId = rows[i].id;
      if (oldId !== newId) {
        // Update child table references first
        await conn.query(`UPDATE ${childTable} SET ${foreignKey} = ? WHERE ${foreignKey} = ?`, [newId, oldId]);
        // Update the main table row
        await conn.query(`UPDATE ${tableName} SET id = ? WHERE id = ?`, [newId, oldId]);
      }
    }

    // Reset auto-increment
    await conn.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = ${rows.length + 1}`);
    
    // Update project_page_url for all items to reflect new IDs
    const [updated] = await conn.query(`SELECT id, project_page_url FROM ${tableName}`);
    for (const row of updated) {
      // Only update auto-generated URLs (those starting with /project/)
      if (row.project_page_url && row.project_page_url.startsWith('/project/')) {
        await conn.query(`UPDATE ${tableName} SET project_page_url = ? WHERE id = ?`, [`/project/${row.id}`, row.id]);
      }
    }

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
