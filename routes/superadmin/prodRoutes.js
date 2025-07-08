const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/superadmin/upload');
const upload2 = require('../../middlewares/superadmin/upload2');
const superadminGuard = require('../../middlewares/superadmin/superadminGuard');

const {
  index,
  view,
  create,
  add,
  edit,
  update,
  deleteRow,
  deleteMany,
  check,
  checkEdit,
  checkCoder,
  checkEditCoder
} = require('../../controllers/superadmin/prodController');


const setSuperadminLayout = require('../../middlewares/superadmin/setLayout');
const populateUser = require('../../middlewares/superadmin/populateUser');

router.use(setSuperadminLayout);
router.use(populateUser);


// 🔐 Apply guard per route
router.get('/', superadminGuard, index);

router.get('/view/:catid/:subcatid', superadminGuard, view);
router.get('/create/:catid/:subcatid', superadminGuard, create);

router.get('/view/:catid', superadminGuard, view);
router.get('/create/:catid', superadminGuard, create);

router.get('/view', superadminGuard, view);
router.post('/view', superadminGuard, view);
router.get('/create', superadminGuard, create);


router.post('/add', superadminGuard, upload2, add);
router.get('/edit/:id', superadminGuard, edit);
router.put('/update/:id', superadminGuard, upload2, update);

router.delete('/delete/:id', superadminGuard, deleteRow);
router.post('/delete-many', superadminGuard, deleteMany);
router.delete('/delete-many', superadminGuard, deleteMany);

router.post('/validate', superadminGuard, check);
router.post('/validate-edit/:id', superadminGuard, checkEdit);
router.post('/validate-coder', superadminGuard, checkCoder);
router.post('/validate-coder-edit/:id', superadminGuard, checkEditCoder);

module.exports = router;
