// routes/index.js
const express = require('express');
const superadminRoutes = require('./superadmin/superadminRoutes');

const adminRoutes = require('./admin/adminRoutes');
const ordinaryRoutes = require('./ordinary/ordinaryRoutes');
const authRoutes = require('./authRoutes'); // add this line
const indexController = require('../controllers/open/indexController');
const router = express.Router();

router.get('/', indexController.handleHome);
router.use(authRoutes); 
router.use('/superadmin', superadminRoutes);
router.use('/admin', adminRoutes);
router.use('/ordinary', ordinaryRoutes);

module.exports = router;

