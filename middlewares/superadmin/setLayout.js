//middlewares\superadmin\setLayout.js
const setSuperadminLayout = (req, res, next) => {
  res.locals.layout = 'superadmin';
  next();
};

module.exports = setSuperadminLayout;
