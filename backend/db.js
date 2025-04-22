const mongoose = require("mongoose");
require("dotenv").config();

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useNewUrlParser: true: Tùy chọn này giúp Mongoose sử dụng bộ phân tích URL
      //  mới thay vì bộ phân tích cũ, giúp kết nối ổn định hơn.

      // useUnifiedTopology: true: Tùy chọn này bật tính năng mới của Mongoose và MongoDB 
      // để giúp kết nối ổn định và hiệu quả hơn, tránh các cảnh báo không cần thiết.
    });
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
