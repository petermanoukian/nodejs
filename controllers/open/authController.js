//C:\My-Documents\nodejs1\controllers\open\authController.js
const authRedirect = require('../../middlewares/authRedirect');
const path = require('path');
const User = require('../../models/User');
const bcrypt = require('bcrypt'); // assuming you're using bcrypt
// If you're using express-session, you should already have session middleware set up

const renderLoginForm = (req, res, next) => {

  if (req.session.user) {
    return authRedirect(req, res, next);
  }

  res.sendFile(path.join(__dirname, '../../views/login.html'));
};

const processSignin = async (req, res) => { 
  try {
    const { identity, password, remember } = req.body;

console.log('🔍 Identity received:', identity);
console.log('🔍 Identity password:', password);

    const user = await User.findOne({
      $or: [{ email: identity }, { username: identity }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

   req.session.user = {
  id: user._id,
  roler: user.roler
};

if (remember === 'on') {
  req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
} else {
  req.session.cookie.expires = false;
}

// 🛠️ SAVE SESSION BEFORE RESPONDING
req.session.save((err) => {
  if (err) {
    console.error('Session save error:', err);
    return res.status(500).json({
      success: false,
      message: 'Session could not be saved'
    });
  }

  let redirectUrl;

  if (user.roler === 'superadmin') {
    redirectUrl = '/superadmin';
  } else if (user.roler === 'admin') {
    redirectUrl = '/admin';
  } else if (user.roler === 'ordinary') {
    redirectUrl = '/ordinary';
  } else {
    console.warn('⚠️ Unknown role:', user.roler);
    return res.status(400).json({
      success: false,
      message: `Unexpected role: ${user.roler}`
    });
  }

  return res.json({
    success: true,
    redirectUrl
  });
});


  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }

    res.clearCookie('connect.sid'); // Default session cookie name
    return res.redirect('/login');
  });
};

module.exports = {
  renderLoginForm,
  processSignin,
  logout
};
