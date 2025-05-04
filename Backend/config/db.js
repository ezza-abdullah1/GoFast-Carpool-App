const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://GoFastCarpoolApp:1234567890@cluster0.gwox1e8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
