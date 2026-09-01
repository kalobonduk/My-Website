const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage config — saves to E:\My Website\temp_database_store
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'temp_database_store');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp-originalname
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi|pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) || mime.startsWith('image/') || mime.startsWith('video/') || mime === 'application/pdf' || mime.includes('document')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// POST upload single file
router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL path that can be stored in DB
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({
    message: 'File uploaded',
    filename: req.file.filename,
    url: fileUrl,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// POST upload multiple files
router.post('/multiple', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const files = req.files.map(f => ({
    filename: f.filename,
    url: '/uploads/' + f.filename,
    size: f.size,
    mimetype: f.mimetype
  }));
  res.json({ message: `${files.length} files uploaded`, files });
});

// DELETE a file
router.delete('/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', '..', 'temp_database_store', req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;
