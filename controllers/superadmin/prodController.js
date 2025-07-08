const Prod = require('../../models/Prod');
const Cat = require('../../models/Cat');
const Subcat = require('../../models/Subcat');
const Tagg = require('../../models/Tagg');
const ProductTagg = require('../../models/ProductTagg'); 

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const index = async (req, res) => {
  res.redirect('/superadmin/prod/view');
};

const view = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';
    const isPost = req.method === 'POST';
    const source = isPost ? req.body : req.query;
    const routeParams = Array.isArray(req.params?.params) ? req.params.params : [];
    const rawCatid = req.params.catid || source.catid || '';
    const rawSubcatid = req.params.subcatid || source.subcatid || '';
    const catid = (rawCatid === '0') ? '' : rawCatid;
    const subcatid = (rawSubcatid === '0') ? '' : rawSubcatid;
    const taggid = source.taggid || '';
    const searchQuery = source.q ? source.q.trim() : '';
    const minPrix = parseFloat(source.minPrix);
    const maxPrix = parseFloat(source.maxPrix);
    const query = {};

    if (searchQuery) {
      query.$or = [
        { name: new RegExp(searchQuery, 'i') },
        { coder: new RegExp(searchQuery, 'i') }
      ];
    }

    if (catid) {
      query.catid = catid;
    }

    if (subcatid) {
      query.subcatid = subcatid;
    }

    let rawTaggids = source.taggid || '';
    let taggidArr = [];

    if (Array.isArray(taggid)) {
      taggidArr = taggid;
    } else if (typeof taggid === 'string' && taggid.includes(',')) {
      taggidArr = taggid.split(',').filter(Boolean);
    } else if (taggid) {
      taggidArr = [taggid];
    }

    if (taggidArr.length) {
      const linked = await ProductTagg.find({ taggId: { $in: taggidArr } }).select('prodId').lean();
      const prodIds = linked.map(link => link.prodId);
      query._id = prodIds.length ? { $in: prodIds } : { $in: [] };
    }


    query.prix = { $gt: 0 }; 
    if (!isNaN(minPrix)) {
      query.prix.$gte = minPrix;
    }
    if (!isNaN(maxPrix)) {
      query.prix.$lte = maxPrix;
    }

    const validSortFields = ['name', '_id', 'ordd', 'coder','catid', 'subcatid'];
    const sortOption = {};

    if (validSortFields.includes(sortField)) {
      sortOption[sortField] = sortDir === 'asc' ? 1 : -1;
    } else {
      sortOption['_id'] = -1;
    }

    const result = await Prod.paginate(query, {
      page,
      limit,
      lean: true,
      populate: ['catid', 'subcatid'],
      sort: sortOption
    });

    const cats = await Cat.find().sort({ name: 1 }).lean();   
    const subcats = await Subcat.find().sort({ name: 1 }).lean(); 
    const taggs = await Tagg.find().sort({ name: 1 }).lean();  
    
    
    const prodIds = result.docs.map(p => p._id);

    const taggLinks = await ProductTagg.find({ prodId: { $in: prodIds } }).lean();

    const taggMap = {};
    taggLinks.forEach(link => {
      const key = link.prodId.toString();
      if (!taggMap[key]) taggMap[key] = [];
      taggMap[key].push(link.taggId.toString());
    });

    const taggLookup = {};
    taggs.forEach(t => {
      taggLookup[t._id.toString()] = t.name;
    });

    result.docs.forEach(prod => {
      const id = prod._id.toString();
      const taggIds = taggMap[id] || [];

      prod.relatedTaggs = taggIds.map(tid => ({
        id: tid,
        name: taggLookup[tid] || 'Unknown'
      }));
    });


    res.render('superadmin/prod/viewprods', {
      prods: result.docs,
      cats,
      subcats,
      taggs, 
      catid,
      subcatid,
      taggid: taggidArr, 
      searchQuery,
      sortField,
      sortDir,
      minPrix: isNaN(minPrix) ? '' : minPrix,
      maxPrix: isNaN(maxPrix) ? '' : maxPrix,
      totalPages: result.totalPages,
      currentPage: result.page,
      title: 'View Products'
    });
  } catch (err) {
    console.error('🔍 Prod view error:', err);
    res.status(500).send('Server error');
  }
};



const create = async (req, res) => {
  try {
    const catid = req.params.catid || req.query.catid || '';
    const subcatid = req.params.subcatid || req.query.subcatid || '';
    const taggid = req.query.taggid || '';
    const cats = await Cat.find().sort({ name: 1 }).lean();
    const taggs = await Tagg.find().sort({ name: 1 }).lean(); 

    let subcats = [];
    if (catid) {
      subcats = await Subcat.find({ catid }).sort({ name: 1 }).lean(); 
    } else {
      subcats = [];
    }

    res.render('superadmin/prod/addprod', {
      cats,
      subcats,
      catid,
      subcatid,
      taggs,      
      taggid,  
      title: 'Add Product'
    });
  } catch (err) {
    console.error('⚙️ Error rendering product form:', err);
    res.status(500).send('Server error');
  }
};


const check = async (req, res) => {
  const { name, catid, subcatid } = req.body;

  if (!name || !catid || !subcatid) {
    return res.status(400).json({ success: false, message: 'Name, category, and subcategory are required.' });
  }

  const exists = await Prod.exists({
    name: new RegExp(`^${name}$`, 'i'),
    catid,
    subcatid
  });

  res.json({ nameTaken: !!exists });
};


const checkCoder = async (req, res) => {
  const { coder } = req.body;
  if (!coder) {
    return res.status(400).json({ success: false, message: 'Coder is required.' });
  }
  const exists = await Prod.exists({
    coder: new RegExp(`^${coder}$`, 'i')
  });
  res.json({ coderTaken: !!exists });
};

const add = async (req, res) => {
  try {
    const {
      name,
      catid,
      subcatid,
      des,
      dess,
      prix,
      coder,
      vis,
      ordd,
      taggs 
    } = req.body;
  
    console.log('📦 Incoming Body:', req.body);
    console.log('📂 Incoming Files:', req.files);
    const imgFile = req.files?.img?.[0];
    const docFile = req.files?.filer?.[0];
    let imgPaths = { large: null, thumbnail: null };
    let filerPath = null;

    if (imgFile) {
      const inputPath = imgFile.path;
      const ext = path.extname(imgFile.filename);
      const base = path.basename(imgFile.filename, ext);
      const thumbFile = `${base}-thumb${ext}`;
      const thumbOutput = path.join('public/uploads/img/prod/thumbnail', thumbFile);
      fs.mkdirSync('public/uploads/img/prod/thumbnail', { recursive: true });
      const metadata = await sharp(inputPath).metadata();
      const shouldResize = metadata.width > 1500 || metadata.height > 1000;
      if (shouldResize) {
        const tempFile = path.join('public/uploads/img/prod', `temp-${imgFile.filename}`);
        await sharp(inputPath)
          .resize({
            width: 1500,
            height: 1000,
            fit: 'inside',
            withoutEnlargement: true
          })
          .toFile(tempFile);
        fs.unlinkSync(inputPath);
        fs.renameSync(tempFile, inputPath);
      }
      imgPaths.large = `img/prod/${imgFile.filename}`;
      await sharp(inputPath)
        .resize(200, 200)
        .toFile(thumbOutput);
      imgPaths.thumbnail = `img/prod/thumbnail/${thumbFile}`;
    }

    if (docFile) 
    {
        filerPath = `filer/prod/${docFile.filename}`;
    }
    const safeOrder = (ordd && !isNaN(ordd)) ? Number(ordd) : 1;
    const newProd = await Prod.create({
      name,
      catid,
      subcatid,
      des,
      dess,
      img: imgPaths,
      filer: filerPath,
      prix: prix ?? null,
      coder,
      vis: vis ?? 1,
      ordd: safeOrder
    });

    const validTaggs = Array.isArray(taggs) ? taggs : taggs ? [taggs] : [];
    const taggLinks = validTaggs.map(taggId => ({
      prodId: newProd._id,
      taggId
    }));

    if (taggLinks.length) {
      await ProductTagg.insertMany(taggLinks); // ⭐ Bulk insert
    }

    req.flash('success_msg', 'Product added successfully!');
    res.redirect(`/superadmin/prod/view/${catid}/${subcatid}`);
  } 
  catch (err) 
  {
    console.error('Add product error:', err);
    res.status(500).json({
      message: `Server error occurred while adding product. catid=${catid}, subcatid=${subcatid}, name=${name}`
    });
  }
};


const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Prod.findById(id).lean();

    if (!prod) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/superadmin/prod/view');
    }

    // Convert prod.catid and prod.subcatid to string
    prod.catid = prod.catid?.toString();
    prod.subcatid = prod.subcatid?.toString();

    let cats = await Cat.find().sort({ name: 1 }).lean();
    cats = cats.map(cat => ({
      ...cat,
      _id: cat._id.toString()
    }));

  let subcats = prod.catid
    ? await Subcat.find({ catid: prod.catid }).sort({ name: 1 }).lean()
    : [];

  subcats = subcats.map(sub => ({
    ...sub,
    _id: sub._id.toString()
  }));

  const taggs = await Tagg.find().sort({ name: 1 }).lean();

  const taggLinks = await ProductTagg.find({ prodId: id }).select('taggId').lean();
  const selectedTaggs = taggLinks.map(t => t.taggId.toString());


  console.log('🔖 Available Taggs taggs:', taggs.map(t => ({ id: t._id.toString(), name: t.name })));
  console.log('🧩 From Prod prod.taggs :', prod.taggs);         
  console.log('🔗 From ProductTagg selectedTaggs :', selectedTaggs); 

    res.render('superadmin/prod/editprod', {
      prod,
      cats,
      subcats,
      taggs,           
      selectedTaggs,  
      title: 'Edit Product'
    });
  } catch (err) {
    console.error('Edit product error:', err);
    res.redirect('/superadmin/prod/view');
  }
};


const checkEdit = async (req, res) => {
  const { name, catid, subcatid } = req.body;
  const { id } = req.params;

  if (!name || !catid || !subcatid || !id) {
    return res.status(400).json({ success: false, message: 'Name, category, subcategory, and product ID are required.' });
  }

  const exists = await Prod.exists({
    name: new RegExp(`^${name}$`, 'i'),
    catid,
    subcatid,
    _id: { $ne: id }
  });

  res.json({ nameTaken: !!exists });
};

const checkEditCoder = async (req, res) => {
  const { coder } = req.body;
  const { id } = req.params;

  if (!coder || !id) {
    return res.status(400).json({ success: false, message: 'Coder and product ID are required.' });
  }

  const exists = await Prod.exists({
    coder: new RegExp(`^${coder}$`, 'i'),
    _id: { $ne: id }
  });

  res.json({ coderTaken: !!exists });
};


const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      catid,
      subcatid,
      des,
      dess,
      prix,
      coder,
      vis,
      ordd , 
      taggs 
    } = req.body;

    const imgFile = req.files?.img?.[0];
    const docFile = req.files?.filer?.[0];

    let imgPaths = {};
    let filerPath;

    if (imgFile) {
      const inputPath = imgFile.path;
      const ext = path.extname(imgFile.filename);
      const base = path.basename(imgFile.filename, ext);
      const thumbFile = `${base}-thumb${ext}`;
      const thumbOutput = path.join('public/uploads/img/prod/thumbnail', thumbFile);

      fs.mkdirSync('public/uploads/img/prod/thumbnail', { recursive: true });

      const metadata = await sharp(inputPath).metadata();
      const shouldResize = metadata.width > 1500 || metadata.height > 1000;

      if (shouldResize) {
        const tempFile = path.join('public/uploads/img/prod', `temp-${imgFile.filename}`);

        await sharp(inputPath)
          .resize({
            width: 1500,
            height: 1000,
            fit: 'inside',
            withoutEnlargement: true
          })
          .toFile(tempFile);

        fs.unlinkSync(inputPath);
        fs.renameSync(tempFile, inputPath);
      }

      imgPaths.large = `img/prod/${imgFile.filename}`;

      await sharp(inputPath)
        .resize(200, 200)
        .toFile(thumbOutput);

      imgPaths.thumbnail = `img/prod/thumbnail/${thumbFile}`;
    }

    if (docFile) {
      filerPath = `filer/prod/${docFile.filename}`;
    }


    const payload = {
      name,
      catid,
      subcatid,
      des,
      dess,
      prix: prix ?? null,
      coder,
      vis: vis ?? 1,
      ordd: ordd ?? 1
    };

    if (imgPaths.large || imgPaths.thumbnail) {
        payload.img = imgPaths;
      }
    if (filerPath) payload.filer = filerPath;

    await Prod.findByIdAndUpdate(id, payload);

    await ProductTagg.deleteMany({ prodId: id });
    const validTaggs = Array.isArray(taggs) ? taggs : taggs ? [taggs] : [];
    const taggLinks = validTaggs.map(taggId => ({
      prodId: id,
      taggId
    }));
    if (taggLinks.length) {
      await ProductTagg.insertMany(taggLinks);
    }


    req.flash('success_msg', 'Product updated successfully!');
    res.redirect(`/superadmin/prod/view/${catid}/${subcatid}`);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: `Server error while updating product ${id}` });
  }
};

const deleteRow = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Prod.findById(id);

    if (!prod) {
      req.flash('error_msg', 'Product not found.');
      return res.redirect('/superadmin/prod/view');
    }

    await Prod.findByIdAndDelete(id);
    req.flash('success_msg', 'Product deleted successfully.');
    res.redirect(`/superadmin/prod/view`);
  } catch (err) {
    console.error('Delete product error:', err);
    req.flash('error_msg', 'Delete failed.');
    res.redirect('/superadmin/prod/view');
  }
};

const deleteMany = async (req, res) => {
  try {
    const raw = req.body.selectedfinal || '';
    const ids = raw.split(',').filter(Boolean);

    if (!Array.isArray(ids) || ids.length === 0) {
      req.flash('error_msg', 'No products selected.');
      return res.redirect('/superadmin/prod/view');
    }

    const result = await Prod.deleteMany({ _id: { $in: ids } });
    req.flash('success_msg', `${result.deletedCount} products deleted.`);
    res.redirect('/superadmin/prod/view');
  } catch (err) {
    console.error('❌ Bulk product delete error:', err);
    req.flash('error_msg', 'Failed to delete selected products.');
    res.redirect('/superadmin/prod/view');
  }
};


module.exports = {
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
};
