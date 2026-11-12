const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Công khai cho mọi người xem danh sách & chi tiết sản phẩm
router.get("/", getProducts);
router.get("/:id", getProductById);

// Bắt buộc đăng nhập (protect) VÀ có quyền Admin (authorize("admin")) mới được Thêm/Sửa/Xóa
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
