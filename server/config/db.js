const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB at localhost:27017/dishwise");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Error connecting to MongoDB:", err);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;