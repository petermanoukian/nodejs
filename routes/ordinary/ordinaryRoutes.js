const express = require('express');
const path = require('path');

const router = express.Router();

// GET /ordinary/dashboard


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/ordinary/dashboard.html'));
});

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/ordinary/dashboard.html'));
});

module.exports = router;
