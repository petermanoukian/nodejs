// controllers/indexController.js
const authRedirect = require('../../middlewares/authRedirect');

exports.handleHome = (req, res, next) => {
  authRedirect(req, res, next);
};
