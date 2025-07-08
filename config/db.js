const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb+srv://bediktest:psrdmquVBDYpoaL7@cluster0.xrmcva2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );

    console.log('🔗 Connected to MongoDB Atlas');
    console.log('📛 Database name:', connection.connection.name);
    console.log('🌐 Host:', connection.connection.host);
    console.log('📦 Port:', connection.connection.port);
    console.log('📡 Ready state (1 = connected):', connection.connection.readyState);
    console.log('🔑 Connection options:', connection.connection.client.options);

    // Optional: List collections if you want
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections in DB:', collections.map(col => col.name));

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

module.exports = { connectDB, mongoose };


