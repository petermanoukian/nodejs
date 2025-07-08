// routes/authRoutes.js

const express = require('express');
//const path = require('path');
const router = express.Router();
const { renderLoginForm, processSignin , logout} = require('../controllers/open/authController');

// GET /login
router.get('/login', renderLoginForm);

// POST /signin
router.post('/signin', processSignin);

router.get('/logout', logout);

module.exports = router;
