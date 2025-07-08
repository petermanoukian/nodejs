//routes\superadmin\catRoutes.js
const express = require('express');
const router = express.Router();
const routesMap = require('./Maps/shop/routesMap');
const routes = routesMap['super.categories'];


const {
   index , renderNewForm,AddCat,updateCat,checkCat,checkCatEdit,viewcats,editCat,
   deleteCat,deleteManyCats
} = require('../../controllers/superadmin/catController');

const superadminGuard = require('../../middlewares/superadmin/superadminGuard');
const setSuperadminLayout = require('../../middlewares/superadmin/setLayout');
const populateUser = require('../../middlewares/superadmin/populateUser');

router.use(setSuperadminLayout);
router.use(populateUser);

/*
router.get('/', superadminGuard, index);
router.get('/view', superadminGuard, viewcats);
router.get('/new', superadminGuard, renderNewForm);
router.get('/edit/:id', superadminGuard, editCat);

router.post('/validate-cat', superadminGuard, checkCat);
router.post('/validate-cat-edit/:id', superadminGuard, checkCatEdit);
router.post('/add', superadminGuard, AddCat);


router.put('/update/:id', superadminGuard, updateCat);


router.delete('/delete/:id', superadminGuard, deleteCat);


router.post('/delete-many', superadminGuard, deleteManyCats);
router.delete('/delete-many', superadminGuard, deleteManyCats);
*/
router.get(routes.view.replace('/superadmin/categories', ''), superadminGuard, viewcats);
router.get(routes.new.replace('/superadmin/categories', ''), superadminGuard, renderNewForm);
router.get(routes.edit(':id').replace('/superadmin/categories', ''), superadminGuard, editCat);

router.post(routes.validate.replace('/superadmin/categories', ''), superadminGuard, checkCat);
router.post(routes.validateEdit(':id').replace('/superadmin/categories', ''), superadminGuard, checkCatEdit);
router.post(routes.add.replace('/superadmin/categories', ''), superadminGuard, AddCat);

router.put(routes.update(':id').replace('/superadmin/categories', ''), superadminGuard, updateCat);
router.delete(routes.delete(':id').replace('/superadmin/categories', ''), superadminGuard, deleteCat);

router.post(routes.deleteMany.replace('/superadmin/categories', ''), superadminGuard, deleteManyCats);
router.delete(routes.deleteMany.replace('/superadmin/categories', ''), superadminGuard, deleteManyCats);

module.exports = router;
