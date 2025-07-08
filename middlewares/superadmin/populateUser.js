const User = require('../../models/User');

const populateUser = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
    console.log('🆔 Session User ID:', userId);

    if (!userId) {
      console.warn('⚠️ No user ID in session. Skipping user population.');
      return next();
    }

    const user = await User.findById(userId).lean();
    //console.log('🔍 Fetched User from DB:', user);

    if (user) {
        res.locals.user = {
        id: user._id.toString(),
        userName: user.username,
        email: user.email,
        roler: user.roler,
        fullName: user.fullName,
        profileImg: user.img?.thumbnail || 'img/nopic.jpg',
        profileImgLarge: user.img?.large || null,
        filer: user.filer || null
        };

      //console.log('✅ User injected into res.locals:', res.locals.user);
    } else {
      console.warn('❌ No user found in DB for the given session ID.');
    }

  } catch (err) {
    console.error('🔥 populateUser middleware error:', err);
  }

  next();
};
module.exports = populateUser;