//middlewares\superadmin\superadminGuard.js
const superadminGuard = (req, res, next) => {
  const user = req.session.user;
  

  if (!user || user.roler !== 'superadmin') {
    return res.status(403).send('Access denied from superamdin middleware Line 6');
  }

  next();
};

module.exports = superadminGuard;
