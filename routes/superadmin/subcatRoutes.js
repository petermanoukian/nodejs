const express = require('express');
const router = express.Router();
const {
  index,
  view,
  create,
  add,
  getSubcatsByCat,
  edit,
  update,
  deleteRow,
  deleteMany,
  check,
  checkEdit
} = require('../../controllers/superadmin/subcatController');

const superadminGuard = require('../../middlewares/superadmin/superadminGuard');
const setSuperadminLayout = require('../../middlewares/superadmin/setLayout');
const populateUser = require('../../middlewares/superadmin/populateUser');

router.use(setSuperadminLayout);
router.use(populateUser);

// 🟢 Use raw route definitions where Express binds handlers
router.get('/view/:catid', superadminGuard, view);

router.get('/api/subcats/:catid', superadminGuard, getSubcatsByCat);
router.get('/api/subcats', superadminGuard, getSubcatsByCat);



router.get('/new/:catid', superadminGuard, create);
router.get('/view', superadminGuard, view);
router.get('/new', superadminGuard, create);
router.get('/edit/:id', superadminGuard, edit);
router.post('/validate', superadminGuard, check);
router.post('/validate-edit/:id', superadminGuard, checkEdit);
router.post('/add', superadminGuard, add);
router.put('/update/:id', superadminGuard, update);
router.delete('/delete/:id', superadminGuard, deleteRow);
router.post('/delete-many', superadminGuard, deleteMany);
router.delete('/delete-many', superadminGuard, deleteMany);

module.exports = router;
