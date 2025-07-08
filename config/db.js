const mongoose = require('mongoose');

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGO_URI || 'mongodb+srv://bediktest:psrdmquVBDYpoaL7@cluster0.xrmcva2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;

