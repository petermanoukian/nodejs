//routes\superadmin\superadminRoutes.js

const express = require('express');
const path = require('path');
const router = express.Router();
const catRoutes = require('./catRoutes');
const subcatRoutes = require('./subcatRoutes');
const prodRoutes = require('./prodRoutes');
const taggRoutes = require('./taggRoutes');

router.use('/cat', catRoutes);
router.use('/subcat', subcatRoutes);
router.use('/prod', prodRoutes);
router.use('/tagg', taggRoutes);


const {
  registerSuperadminUser, index, renderRegisterForm, checkUsernameOrEmail , viewusers ,
  edituser , checkUsernameOrEmailEdit , updateuser , deleteUser , deleteManyUsers
} = require('../../controllers/superadmin/superadminController');

const upload = require('../../middlewares/superadmin/upload');
const superadminGuard = require('../../middlewares/superadmin/superadminGuard');
const setSuperadminLayout = require('../../middlewares/superadmin/setLayout');

const populateUser = require('../../middlewares/superadmin/populateUser');
 // applies to all superadmin routes

router.use(setSuperadminLayout);
router.use(populateUser);
router.get('/', superadminGuard, index);
router.get('/dashboard', superadminGuard, index);
router.get('/users', superadminGuard, viewusers);
router.get('/user/edit/:id', superadminGuard, edituser);
router.get('/register', superadminGuard, renderRegisterForm);
router.post('/register/add', superadminGuard, upload, registerSuperadminUser);
router.put('/user/update/:id', superadminGuard, upload, updateuser);
router.post('/validate-user', superadminGuard, checkUsernameOrEmail);
router.post('/validate-user-edit/:id', superadminGuard, checkUsernameOrEmailEdit);
router.delete('/user/delete/:id', superadminGuard, deleteUser);
router.post('/user/delete-many', superadminGuard, deleteManyUsers);
router.delete('/user/delete-many', superadminGuard, deleteManyUsers);
module.exports = router;

