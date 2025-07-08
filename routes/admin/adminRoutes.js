const express = require('express');
const path = require('path');

const router = express.Router();

// GET /admin/dashboard

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/dashboard.html'));
});

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/dashboard.html'));
});

module.exports = router;
