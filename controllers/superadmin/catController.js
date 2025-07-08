//controllers\superadmin\catController.js
const Cat = require('../../models/Cat');
const Subcat = require('../../models/Subcat');
const Prod = require('../../models/Prod');
const path = require('path');

const fs = require('fs');

const superadminGuard = require('../../middlewares/superadmin/superadminGuard');

const runGuard = (req, res) =>
  new Promise((resolve, reject) =>
    superadminGuard(req, res, (err) => (err ? reject(err) : resolve()))
  );


const index = async (req, res) => {
    try {
        res.render('superadmin/cat/index', {
        title: 'View categories'
        });
    } catch (err) {
        console.error('error:', err);
        res.status(500).send('Server error');
    }
};


const renderNewForm = (req, res) => {
    res.render('superadmin/cat/addcat', {
        title: 'Add Category'
    });
};

const AddCat = async (req, res) => {
    try {
      const { name } = req.body;
      await Cat.create({ name });
      req.flash('success_msg', 'Added successfully!');
      res.redirect('/superadmin/cat/view');
    } catch (err) {
      console.error('Add error:', err);
      res.status(500).json({ message: 'Server error' + err});
    }
};

const updateCat = async (req, res) => {
  try {
    const { name } = req.body;
    const cat = await Cat.findById(req.params.id);

    if (!cat) {
      req.flash('error_msg', 'Not found.');
      return res.redirect('/superadmin/cat/view');
    }

    await Cat.findByIdAndUpdate(cat._id, { name });
    req.flash('success_msg', 'Updated successfully!');
    res.redirect('/superadmin/cat/view');
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkCat = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'No name provided' });

  const exists = await Cat.exists({ name: new RegExp(`^${name}$`, 'i') });
  res.json({ nameTaken: !!exists });
};


const checkCatEdit = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) return res.status(400).json({ success: false, message: 'No name provided' });

  const exists = await Cat.exists({
    name: new RegExp(`^${name}$`, 'i'),
    _id: { $ne: id }
  });
  res.json({ nameTaken: !!exists });
};



/*
const viewcats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const filterRole = req.query.role || '';

    const query = {};

    // Build search logic
    if (searchQuery) {
      query.name = new RegExp(searchQuery, 'i');
    }

      const result = await Cat.paginate(query, {
      page,
      limit,
      lean: true,
      sort: { [sortField]: sortDir === 'desc' ? -1 : 1 }
    });

    res.render('superadmin/cat/viewcats', {
      cats: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      sortField,
      sortDir,
      searchQuery,
      filterRole, 
      title: 'View Categories'
    });
  } catch (err) {
    console.error('Pagination error:', err);
    res.status(500).send('Server error ' + err);
  }
};
*/

const viewcats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const filterRole = req.query.role || '';

    const query = {};

    // 🔍 Search by name
    if (searchQuery) {
      query.name = new RegExp(searchQuery, 'i');
    }

    // 📦 Paginate categories
    const result = await Cat.paginate(query, {
      page,
      limit,
      lean: true,
      sort: { [sortField]: sortDir === 'desc' ? -1 : 1 }
    });

    // ➕ Attach subcatCount to each category
    const catsWithCounts = await Promise.all(
      result.docs.map(async (cat) => {
        const subcatCount = await Subcat.countDocuments({ catid: cat._id });
        const prodCount = await Prod.countDocuments({ catid: cat._id }); // ✅ Add this line
        return { ...cat, subcatCount, prodCount };
      })
    );


    // 🎯 Render enriched data
    res.render('superadmin/cat/viewcats', {
      cats: catsWithCounts,
      totalPages: result.totalPages,
      currentPage: result.page,
      sortField,
      sortDir,
      searchQuery,
      filterRole,
      title: 'View Categories'
    });
  } catch (err) {
    console.error('Pagination error:', err);
    res.status(500).send('Server error ' + err);
  }
};


const editCat = async (req, res) => {
  const Idx = req.params.id;

  if (!Idx) {
    return res.redirect('/superadmin/cat/view');
  }

  try {
    const catx = await Cat.findById(Idx);

    if (!catx) {
      return res.redirect('/superadmin/cat/view');
    }

    res.render('superadmin/cat/editCat', {  cat: catx.toObject(),   Idx});
  } catch (error) {
    console.error('🔧 Error fetching for edit:', error);
    return res.redirect('/superadmin/cat/view');
  }
};


const deleteCat = async (req, res) => {
  const Id = req.params.id;

  try {
    const cat = await Cat.findById(Id);
    if (!cat) {
      req.flash('error_msg', 'Not found.');
      return res.redirect('/superadmin/cat/view');
    }

    await Cat.findByIdAndDelete(Id);
    req.flash('success_msg', 'deleted successfully.');
    res.redirect('/superadmin/cat/view');

  } catch (err) {
    console.error('❌ Error deleting :', err);
    req.flash('error_msg', 'Error deleting record.');
    res.redirect('/superadmin/cat/view');
  }
};

const deleteManyCats = async (req, res) => {
  try {
      
        const raw = req.body.selectedfinal || '';
        const ids = raw.split(',').filter(Boolean);
        if (!Array.isArray(ids) || ids.length === 0) {
          req.flash('error_msg', 'No selected selectedIds ids-' + ids);
          return res.redirect('/superadmin/cat/view');
        }
        const result = await Cat.deleteMany({ _id: { $in: ids } });
        req.flash('success_msg', `${result.deletedCount} record(s) deleted successfully.`);
        res.redirect('/superadmin/cat/view');
  } catch (err) {
    console.error('❌ Error deleting multiple records:', err);
    req.flash('error_msg', 'Error deleting selected records.');
    res.redirect('/superadmin/cat/view');
  }
};

module.exports = { 
   index , renderNewForm,AddCat,updateCat,checkCat,checkCatEdit,viewcats,editCat,
   deleteCat,deleteManyCats
};
