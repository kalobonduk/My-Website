const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve uploaded files from temp_database_store
app.use('/uploads', express.static(path.join(__dirname, '..', 'temp_database_store')));

// API Routes
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/portfolio-images', require('./routes/portfolioImages'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/homepage', require('./routes/homepage'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dynamic project detail page — serves for /project/:id
app.get('/project/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'project.html'));
});

// Serve the entire frontend website (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
