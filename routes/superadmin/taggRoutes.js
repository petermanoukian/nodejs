const express = require('express');
const router = express.Router();

const {
  view,
  renderNewForm,
  addTagg,
  updateTagg,
  checkTagg,
  checkTaggEdit,
  viewTaggs,
  editTagg,
  deleteTagg,
  deleteManyTaggs
} = require('../../controllers/superadmin/taggController');

const superadminGuard = require('../../middlewares/superadmin/superadminGuard');
const setSuperadminLayout = require('../../middlewares/superadmin/setLayout');
const populateUser = require('../../middlewares/superadmin/populateUser');

router.use(setSuperadminLayout);
router.use(populateUser);

router.get('/', superadminGuard, viewTaggs);
router.get('/view', superadminGuard, viewTaggs);
router.get('/create', superadminGuard, renderNewForm);
router.get('/edit/:id', superadminGuard, editTagg);
router.post('/validate', superadminGuard, checkTagg);
router.post('/validate-edit/:id', superadminGuard, checkTaggEdit);

router.post('/add', superadminGuard, addTagg);

router.put('/update/:id', superadminGuard, updateTagg);

router.delete('/delete/:id', superadminGuard, deleteTagg);

router.post('/delete-many', superadminGuard, deleteManyTaggs);
router.delete('/delete-many', superadminGuard, deleteManyTaggs);

module.exports = router;
