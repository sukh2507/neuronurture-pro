const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/neuronurture',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`connection successful: ${conn.connection.host}`);
  } catch (error) {
    console.error(' connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;