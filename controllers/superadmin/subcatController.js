//controllers\superadmin\subcatController.js

const Subcat = require('../../models/Subcat');
const Cat = require('../../models/Cat'); // for dropdown population
const Prod = require('../../models/Prod');
const index = async (req, res) => {
  res.redirect('/superadmin/subcat/view');
};

const view = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const catid = req.params.catid || req.query.catid || '';

    const query = {};

    if (searchQuery) {
      query.name = new RegExp(searchQuery, 'i');
    }

    if (catid) {
      query.catid = catid;
    }

    const sortOption = {};
    if (sortField === 'catid') {
    sortOption['catid.name'] = sortDir === 'asc' ? 1 : -1;
    } else if (['name', '_id'].includes(sortField)) {
    sortOption[sortField] = sortDir === 'asc' ? 1 : -1;
    } else {
    // fallback protection
    sortOption['_id'] = -1;
    }

    const result = await Subcat.paginate(query, {
      page,
      limit,
      lean: true,
      populate: 'catid',
      sort: sortOption
    });

    const cats = await Cat.find().lean();

    const subcatsWithCounts = await Promise.all(
      result.docs.map(async (subcat) => {
        const prodCount = await Prod.countDocuments({ subcatid: subcat._id });
        return { ...subcat, prodCount };
      })
    );


    res.render('superadmin/subcat/viewsubcats', {
      subcats: subcatsWithCounts,
      cats,
      catid,
      searchQuery,
      sortField,
      sortDir,
      totalPages: result.totalPages,
      currentPage: result.page,
      title: 'View Subcategories'
    });
  } catch (err) {
    console.error('🔍 Subcat view error:', err);
    res.status(500).send('Server error');
  }
};



const create = async (req, res) => {
  try {
    const catid = req.params.catid || req.query.catid || null;
    const cats = await Cat.find().lean();
    res.render('superadmin/subcat/addsubcat', {
      cats,
      catid,
      title: 'Add Subcategory'
    });
  } catch (err) {
    console.error('⚙️ Error rendering form:', err);
    res.status(500).send('Server error');
  }
};


const add = async (req, res) => {
  try {
    const { name, catid } = req.body;
    await Subcat.create({ name, catid });
    req.flash('success_msg', 'Subcategory added successfully!');
    res.redirect(`/superadmin/subcat/view/${catid}`);
  } catch (err) {
    console.error('Add subcat error:', err);
    res.status(500).json({ message: 'Server error is ' + err + ' catid' + catid + ' name ' + name});
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const subcat = await Subcat.findById(id).lean();
    const cats = await Cat.find().lean();

    if (!subcat) {
      req.flash('error_msg', 'Not found.');
      return res.redirect('/superadmin/subcat/view');
    }

    res.render('superadmin/subcat/editsubcat', {
      subcat,
      cats,
      title: 'Edit Subcategory'
    });
  } catch (err) {
    console.error('Edit error:', err);
    res.redirect('/superadmin/subcat/view');
  }
};

const update = async (req, res) => {
  try {
    const { name, catid } = req.body;
    const { id } = req.params;

    await Subcat.findByIdAndUpdate(id, { name, catid });
    req.flash('success_msg', 'Updated successfully!');
    res.redirect(`/superadmin/subcat/view/${catid}`);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRow = async (req, res) => {
  try {
    const { id } = req.params;
    const subcat = await Subcat.findById(id);

    if (!subcat) {
      req.flash('error_msg', 'Not found.');
      return res.redirect('/superadmin/subcat/view');
    }

    await Subcat.findByIdAndDelete(id);
    req.flash('success_msg', 'Deleted successfully.');
    res.redirect(`/superadmin/subcat/view`);
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error_msg', 'Delete failed.');
    res.redirect('/superadmin/subcat/view');
  }
};

const deleteMany = async (req, res) => {
  try {
    const raw = req.body.selectedfinal || '';
    const ids = raw.split(',').filter(Boolean);

    if (!Array.isArray(ids) || ids.length === 0) {
      req.flash('error_msg', 'No selected IDs.');
      return res.redirect('/superadmin/subcat/view');
    }

    const result = await Subcat.deleteMany({ _id: { $in: ids } });
    req.flash('success_msg', `${result.deletedCount} subcategories deleted.`);
    res.redirect('/superadmin/subcat/view');
  } catch (err) {
    console.error('❌ Delete many error:', err);
    req.flash('error_msg', 'Failed to delete selected.');
    res.redirect('/superadmin/subcat/view');
  }
};

const check = async (req, res) => {
  const { name, catid } = req.body;
  if (!name || !catid) {
    return res.status(400).json({ success: false, message: 'Name and category are required.' });
  }

const exists = await Subcat.exists({
    name: new RegExp(`^${name}$`, 'i'),
    catid: catid
  });

  res.json({ nameTaken: !!exists });
};


const checkEdit = async (req, res) => {
  const { name, catid } = req.body;
  const { id } = req.params;

  if (!name || !catid) {
    return res.status(400).json({ success: false, message: 'Name and category are required.' });
  }

  const exists = await Subcat.exists({
    name: new RegExp(`^${name}$`, 'i'),
    catid: catid,
    _id: { $ne: id }
  });

  res.json({ nameTaken: !!exists });
};


const getSubcatsByCat = async (req, res) => {
  try 
  {
    const catid = req.params.catid || req.query.catid;
    const query = (catid && catid !== '0') ? { catid } : {};
    const subcats = await Subcat.find(query).select('_id name').lean();
    res.json(subcats);
  } 
  catch (err) 
  {
    console.error('📡 Subcat fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve subcategories.' });
  }
};


module.exports = {
  index,
  view,
  create,
  getSubcatsByCat,
  add,
  edit,
  update,
  deleteRow,
  deleteMany,
  check,
  checkEdit
};

