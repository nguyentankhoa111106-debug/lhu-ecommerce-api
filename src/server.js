require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const shippingRoutes = require("./routes/shippingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối CSDL MongoDB Atlas
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ giao diện Frontend tĩnh (index.html, admin.html, css, js)
app.use(express.static(path.join(__dirname, "../public")));

// Route kiểm tra trạng thái Server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Hệ thống Quản lý Bán Đồng Hồ Chronos hoạt động ổn định!",
    timestamp: new Date().toISOString(),
  });
});

// Đăng ký các API Routes chính thức
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/shipping", shippingRoutes);

// Điều hướng trang chủ về index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Xử lý Route API không tồn tại (404)
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn API [${req.method}] ${req.originalUrl} không tồn tại!`,
  });
});

// Phục vụ fallback cho single page hoặc file tĩnh
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`🚀 Chronos Watch Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🌐 Storefront: http://localhost:${PORT}/index.html`);
  console.log(`⚙️ Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log("====================================================");
});
