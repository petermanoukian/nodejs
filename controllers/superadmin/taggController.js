const Tagg = require('../../models/Tagg');
const Prod = require('../../models/Prod');
const ProductTagg = require('../../models/ProductTagg'); 
const superadminGuard = require('../../middlewares/superadmin/superadminGuard');

const runGuard = (req, res) =>
  new Promise((resolve, reject) =>
    superadminGuard(req, res, (err) => (err ? reject(err) : resolve()))
  );


const view = async (req, res) => {
  try {
    res.render('superadmin/tagg/viewtaggs', {
      title: 'View Tags'
    });
  } catch (err) {
    console.error('Index error:', err);
    res.status(500).send('Server error');
  }
};


const renderNewForm = (req, res) => {
  res.render('superadmin/tagg/addtagg', {
    title: 'Add Tag'
  });
};


const addTagg = async (req, res) => {
  try {
    const { name } = req.body;
    await Tagg.create({ name });
    req.flash('success_msg', 'Tag added successfully!');
    res.redirect('/superadmin/tagg/view');
  } catch (err) {
    console.error('Add error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateTagg = async (req, res) => {
  try {
    const { name } = req.body;
    const tagg = await Tagg.findById(req.params.id);

    if (!tagg) {
      req.flash('error_msg', 'Tag not found.');
      return res.redirect('/superadmin/tagg/view');
    }

    await Tagg.findByIdAndUpdate(tagg._id, { name });
    req.flash('success_msg', 'Updated successfully!');
    res.redirect('/superadmin/tagg/view');
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkTagg = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'No name provided' });

  const exists = await Tagg.exists({ name: new RegExp(`^${name}$`, 'i') });
  res.json({ nameTaken: !!exists });
};

const checkTaggEdit = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) return res.status(400).json({ success: false, message: 'No name provided' });

  const exists = await Tagg.exists({
    name: new RegExp(`^${name}$`, 'i'),
    _id: { $ne: id }
  });
  res.json({ nameTaken: !!exists });
};


const viewTaggs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';
    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const query = {};

    if (searchQuery) {
      query.name = new RegExp(searchQuery, 'i');
    }

    const result = await Tagg.paginate(query, {
      page,
      limit,
      lean: true,
      sort: { [sortField]: sortDir === 'desc' ? -1 : 1 }
    });

    const taggIds = result.docs.map(t => t._id);

    const taggCountsRaw = await ProductTagg.aggregate([
      { $match: { taggId: { $in: taggIds } } },
      { $group: { _id: '$taggId', count: { $sum: 1 } } }
    ]);

    const taggCountMap = {};
    taggCountsRaw.forEach(item => {
      taggCountMap[item._id.toString()] = item.count;
    });


    result.docs.forEach(tagg => {
      tagg.prodCount = taggCountMap[tagg._id.toString()] || 0;
    });

    res.render('superadmin/tagg/viewtaggs', {
      taggs: result.docs,
      totalPages: result.totalPages,
      totalPages: result.totalPages,
      currentPage: result.page,
      sortField,
      sortDir,
      searchQuery,
      title: 'View Tags'
    });
  } catch (err) {
    console.error('Pagination error:', err);
    res.status(500).send('Server error');
  }
};


const editTagg = async (req, res) => {
  const Idx = req.params.id;

  if (!Idx) return res.redirect('/superadmin/tagg/view');

  try {
    const tagg = await Tagg.findById(Idx);
    if (!tagg) return res.redirect('/superadmin/tagg/view');

    res.render('superadmin/tagg/edittagg', { tagg: tagg.toObject(), Idx });
  } catch (err) {
    console.error('Edit fetch error:', err);
    return res.redirect('/superadmin/tagg/view');
  }
};


const deleteTagg = async (req, res) => {
  try {
    const tag = await Tagg.findById(req.params.id);
    if (!tag) {
      req.flash('error_msg', 'Tag not found.');
      return res.redirect('/superadmin/tagg/view');
    }

    await Tagg.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Tag deleted successfully!');
    res.redirect('/superadmin/tagg/view');
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error_msg', 'Error deleting record.');
    res.redirect('/superadmin/tagg/view');
  }
};


const deleteManyTaggs = async (req, res) => {
  try {
    const raw = req.body.selectedfinal || '';
    const ids = raw.split(',').filter(Boolean);
    if (!Array.isArray(ids) || ids.length === 0) {
      req.flash('error_msg', 'No IDs selected.');
      return res.redirect('/superadmin/tagg/view');
    }

    const result = await Tagg.deleteMany({ _id: { $in: ids } });
    req.flash('success_msg', `${result.deletedCount} record(s) deleted successfully.`);
    res.redirect('/superadmin/tagg/view');
  } catch (err) {
    console.error('Delete many error:', err);
    req.flash('error_msg', 'Error deleting selected records.');
    res.redirect('/superadmin/tagg/view');
  }
};

module.exports = {
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
};
