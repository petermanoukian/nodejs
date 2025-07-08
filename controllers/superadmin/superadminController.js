//controllers\superadmin\superadminController.js
const User = require('../../models/User');
const sharp = require('sharp');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const superadminGuard = require('../../middlewares/superadmin/superadminGuard');

const runGuard = (req, res) =>
  new Promise((resolve, reject) =>
    superadminGuard(req, res, (err) => (err ? reject(err) : resolve()))
  );


const index = async (req, res) => {
  try {
    await runGuard(req, res);

    res.render('superadmin/dashboard', {
      title: 'Superadmin Dashboard'
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Server error');
  }
};



const renderRegisterForm = (req, res) => {
  res.render('superadmin/register', {
    title: 'Register New User on NodeJS'
  });
};


  const registerSuperadminUser = async (req, res) => 
  {
    try 
    {
      const { fullName, email, username, password, roler } = req.body;
      const imgFile = req.files?.img?.[0];
      const docFile = req.files?.filer?.[0];

      let imgPaths = { large: null, thumbnail: null };
      let filerPath = null;

      if (imgFile) 
      {
        const inputPath = imgFile.path;
        const ext = path.extname(imgFile.filename);
        const base = path.basename(imgFile.filename, ext);
        const thumbFile = `${base}-thumb${ext}`;
        const thumbOutput = path.join('public/uploads/img/thumbnail', thumbFile);

        fs.mkdirSync('public/uploads/img/thumbnail', { recursive: true });

        const metadata = await sharp(inputPath).metadata();
        const shouldResize = metadata.width > 1500 || metadata.height > 1000;

          if (shouldResize) {
            const tempFile = path.join('public/uploads/img', `temp-${imgFile.filename}`);

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

          imgPaths.large = `img/${imgFile.filename}`;

          await sharp(inputPath)
            .resize(200, 200)
            .toFile(thumbOutput);

          imgPaths.thumbnail = `img/thumbnail/${thumbFile}`;
        }


        if (docFile) 
        {
          filerPath = `filer/${docFile.filename}`;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          fullName,
          email,
          username,
          password: hashedPassword,
          roler,
          img: imgPaths,
          filer: filerPath
      });

      await newUser.save();
      req.flash('success_msg', 'User registered successfully!');
      return res.redirect('/superadmin/users');
    } 
    catch (err) 
    {
      console.error('Registration error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  };



  const updateuser = async (req, res) => {
    const userIdx = req.params.id;

    try {
      const { fullName, email, username, password, roler } = req.body;
      const imgFile = req.files?.img?.[0];
      const docFile = req.files?.filer?.[0];

      let updates = { fullName, email, username, roler };

      const userx = await User.findById(userIdx);
      if (!userx) {
        req.flash('error_msg', 'User not found.');
        return res.redirect('/superadmin/users');
      }

      // 🔐 Only hash if a new password is provided
      if (password && password.trim().length >= 6) {
        updates.password = await bcrypt.hash(password, 10);
      }

      // 🖼️ Handle image
      if (imgFile) {
        const inputPath = imgFile.path;
        const ext = path.extname(imgFile.filename);
        const base = path.basename(imgFile.filename, ext);
        const thumbFile = `${base}-thumb${ext}`;
        const thumbOutput = path.join('public/uploads/img/thumbnail', thumbFile);

        fs.mkdirSync('public/uploads/img/thumbnail', { recursive: true });

        const metadata = await sharp(inputPath).metadata();
        const shouldResize = metadata.width > 1500 || metadata.height > 1000;

        if (shouldResize) {
          const tempFile = path.join('public/uploads/img', `temp-${imgFile.filename}`);
          await sharp(inputPath)
            .resize({ width: 1500, height: 1000, fit: 'inside', withoutEnlargement: true })
            .toFile(tempFile);
          fs.unlinkSync(inputPath);
          fs.renameSync(tempFile, inputPath);
        }

        await sharp(inputPath).resize(200, 200).toFile(thumbOutput);
        updates.img = {
            large: `img/${imgFile.filename}`,
            thumbnail: `img/thumbnail/${thumbFile}`,
          };
        }

        // 📎 Handle optional document
        if (docFile) {
          updates.filer = `filer/${docFile.filename}`;
        }

        await User.findByIdAndUpdate(userIdx, updates, { new: true });
        req.flash('success_msg', 'User updated successfully!');
        return res.redirect('/superadmin/users');

    } catch (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  };


const checkUsernameOrEmail = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({ success: false, message: 'No email or username provided' });
    }

    const existingEmail = email
      ? await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
      : null;

    const existingUsername = username
      ? await User.findOne({ username: new RegExp(`^${username}$`, 'i') })
      : null;

    return res.json({
      emailTaken: !!existingEmail,
      usernameTaken: !!existingUsername
    });
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


const checkUsernameOrEmailEdit = async (req, res) => {
  try {
    const { email, username } = req.body;
    const { id } = req.params;

    if (!email && !username) {
      return res.status(400).json({ success: false, message: 'No email or username provided' });
    }

    const existingEmailUser = email
      ? await User.findOne({
          email: new RegExp(`^${email}$`, 'i'),
          _id: { $ne: id }
        })
      : null;

    const existingUsernameUser = username
      ? await User.findOne({
          username: new RegExp(`^${username}$`, 'i'),
          _id: { $ne: id }
        })
      : null;

    return res.json({
      emailTaken: !!existingEmailUser,
      usernameTaken: !!existingUsernameUser
    });
  } catch (err) {
    console.error('Validation error (edit):', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


 const viewusers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const sortField = req.query.sort || '_id';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const filterRole = req.query.role || '';

    const query = {};
    if (searchQuery) {
      query.$or = [
        { fullName: new RegExp(searchQuery, 'i') },
        { email: new RegExp(searchQuery, 'i') },
        { username: new RegExp(searchQuery, 'i') }
      ];
    }

    if (filterRole) {
      query.roler = filterRole;
    }

    const result = await User.paginate(query, {
      page,
      limit,
      lean: true,
      sort: { [sortField]: sortDir === 'desc' ? -1 : 1 }
    });

    res.render('superadmin/users', {
      users: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      sortField,
      sortDir,
      searchQuery,
      filterRole, 
      title: 'View Users'
    });
  } catch (err) {
    console.error('Pagination error:', err);
    res.status(500).send('Server error');
  }
};


const edituser = async (req, res) => {
  const userIdx = req.params.id;

  if (!userIdx) {
    return res.redirect('/superadmin/users');
  }

  try {
    const userx = await User.findById(userIdx);

    if (!userx) {
      return res.redirect('/superadmin/users');
    }

    res.render('superadmin/editUser', {  userx: userx.toObject(),   userIdx});
  } catch (error) {
    console.error('🔧 Error fetching user for edit:', error);
    return res.redirect('/superadmin/users');
  }
};


const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/superadmin/users');
    }

    await User.findByIdAndDelete(userId);
    req.flash('success_msg', 'User deleted successfully.');
    res.redirect('/superadmin/users');

  } catch (err) {
    console.error(' Error deleting user:', err);
    req.flash('error_msg', 'Error deleting user.');
    res.redirect('/superadmin/users');
  }
};

const deleteManyUsers = async (req, res) => {
  try {
        const raw = req.body.selectedfinal || '';
        const ids = raw.split(',').filter(Boolean);
        if (!Array.isArray(ids) || ids.length === 0) {
          req.flash('error_msg', 'No selected selectedIds . ' + selectedIds + ' ids-' + ids);
          return res.redirect('/superadmin/users');
        }
        const currentUserId = req.session?.user?.id?.toString();
        const filteredIds = ids.filter(id => id !== currentUserId);
        const result = await User.deleteMany({ _id: { $in: filteredIds } });
        req.flash('success_msg', `${result.deletedCount} user(s) deleted successfully.`);
        res.redirect('/superadmin/users');

  } catch (err) {
    console.error('❌ Error deleting multiple users:', err);
    req.flash('error_msg', 'Error deleting selected users.');
    res.redirect('/superadmin/users');
  }
};


module.exports = { 
  registerSuperadminUser , index , renderRegisterForm , 
  checkUsernameOrEmail , viewusers , edituser , checkUsernameOrEmailEdit ,
  updateuser , deleteUser , deleteManyUsers
};
