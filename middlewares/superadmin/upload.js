//middlewares\superadmin\upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define dynamic storage logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/uploads/';

    if (file.fieldname === 'filer') {
      folder += 'filer';
    } else if (file.fieldname === 'img') {
      folder += 'img';
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});

// Define strict file filter based on field
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const field = file.fieldname;

  const imageTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const docTypes = ['.pdf', '.doc', '.docx', '.txt'];

  const isImage = imageTypes.includes(ext);
  const isDoc = docTypes.includes(ext);

  if (
    (field === 'filer' && (isImage || isDoc)) ||
    (field === 'img' && isImage)
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

const handleSuperadminFiles = upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'filer', maxCount: 1 }
]);


module.exports = handleSuperadminFiles;
