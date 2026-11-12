const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Các endpoint API Đơn hàng theo chuẩn Rubric
router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/myorders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/pay", orderController.payOrder);
router.put("/:id/deliver", orderController.deliverOrder);
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;
