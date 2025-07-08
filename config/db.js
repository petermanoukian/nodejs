const mongoose = require('mongoose');

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/express_auth')
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;

