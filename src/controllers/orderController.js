const Order = require("../models/Order");
const Product = require("../models/Product");
const sendOrderInvoice = require("../utils/sendEmail");

// [POST] /api/orders - Đặt hàng mới (Zero-Trust Pricing & Trừ kho nguyên tử $inc)
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod,
      items,
      shippingFee,
      note,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng của bạn đang trống!" });
    }
    if (!customerName || !customerPhone || !customerEmail || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng điền đầy đủ: Họ tên, Số điện thoại, Email và Địa chỉ nhận hàng!",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    // Zero-Trust Pricing & Kiểm tra tồn kho trước
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm có mã ID: ${item.productId}`,
        });
      }

      const availableStock = product.stock !== undefined ? product.stock : (product.countInStock || 0);
      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} chiếc trong kho (bạn đặt ${item.quantity})!`,
        });
      }

      // Zero-Trust: Giá máy chủ MongoDB quyết định, bỏ qua giá client gửi lên
      const itemPrice = Number(product.salePrice || product.price || 0);

      // Trừ kho nguyên tử bằng toán tử $inc chuẩn MongoDB Atlas
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, countInStock: -item.quantity },
      });

      subtotal += itemPrice * item.quantity;
      verifiedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: product.image,
      });
    }

    const finalShippingFee =
      shippingFee !== undefined ? Number(shippingFee) : 25000;
    const totalAmount = subtotal + finalShippingFee;
    const orderCode = "DH" + Date.now().toString().slice(-8);

    const order = await Order.create({
      orderCode,
      user: req.user ? req.user._id : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      shippingAddress: shippingAddress.trim(),
      items: verifiedItems,
      shippingFee: finalShippingFee,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      note: note ? note.trim() : "",
    });

    // In và gửi hóa đơn (bất đồng bộ không chặn luồng chính)
    try {
      sendOrderInvoice(order);
    } catch (e) {
      console.warn("Không gửi được email hóa đơn:", e.message);
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders - Lấy danh sách tất cả đơn hàng (Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders/myorders - Xem đơn cá nhân của người dùng đã đăng nhập
exports.getMyOrders = async (req, res) => {
  try {
    const query = {};
    if (req.user) {
      query.$or = [{ user: req.user._id }, { customerEmail: req.user.email }];
    } else if (req.query.email) {
      query.customerEmail = req.query.email;
    } else if (req.query.phone) {
      query.customerPhone = req.query.phone;
    } else {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email hoặc đăng nhập để xem đơn hàng cá nhân!",
      });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders/:id - Xem chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/orders/:id/pay - Nút thao tác trực tiếp duyệt thanh toán
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    order.paymentStatus = "PAID";
    if (order.orderStatus === "PENDING") {
      order.orderStatus = "CONFIRMED";
    }
    order.paidAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Duyệt thanh toán đơn hàng thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/orders/:id/deliver - Nút thao tác trực tiếp xác nhận đã giao hàng
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    order.orderStatus = "DELIVERED";
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Xác nhận giao hàng thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/orders/:id/status - Cập nhật trạng thái đơn hàng tùy chọn
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.orderStatus = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID") updateData.paidAt = new Date();
    }
    if (status === "DELIVERED" || status === "COMPLETED") {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
