// middlewares/authRedirect.js
module.exports = (req, res, next) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/login');
  }

  switch (user.roler) {
    case 'superadmin':
      return res.redirect('/superadmin');
    case 'admin':
      return res.redirect('/admin');
    case 'ordinary':
      return res.redirect('/ordinary');
    default:
      console.warn('⚠️ Unknown role:', user.roler);
      return res.status(400).json({
        success: false,
        message: `Unexpected role: ${user.roler}`,
      });
  }
};
