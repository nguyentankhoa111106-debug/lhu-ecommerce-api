const Order = require("../models/Order");

// [POST] /api/payment/create-qr - Tạo mã thanh toán QR động chuẩn VietQR Napas 247 & MoMo
exports.createPaymentQR = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    const totalAmount = order.totalAmount;
    const orderCode = order.orderCode;
    let qrUrl = "";

    // Cấu hình Ngân hàng HDBank - Nguyễn Tấn Khoa
    const bankId = process.env.BANK_ID || "HDB";
    const accountNo = process.env.BANK_ACCOUNT_NO || "0859635701";
    const accountName = process.env.BANK_ACCOUNT_NAME || "NGUYEN TAN KHOA";
    const momoPhone = process.env.MOMO_PHONE || "0859635701";
    const transferNote = `DH ${orderCode}`;

    if (paymentMethod === "VIETQR" || !paymentMethod) {
      // 1. Chuẩn VietQR (Napas 247)
      const encodedAccountName = encodeURIComponent(accountName);
      const encodedAddInfo = encodeURIComponent(transferNote);

      qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodedAddInfo}&accountName=${encodedAccountName}`;
    } else if (paymentMethod === "MOMO_QR") {
      // 2. Mã QR MoMo
      const encodedAccountName = encodeURIComponent(accountName);
      const encodedAddInfo = encodeURIComponent(transferNote);
      qrUrl = `https://img.vietqr.io/image/MOMO-${momoPhone}-compact2.png?amount=${totalAmount}&addInfo=${encodedAddInfo}&accountName=${encodedAccountName}`;
    }

    res.status(200).json({
      success: true,
      message: "Tạo mã thanh toán QR thành công",
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        totalAmount,
        bankId,
        accountNo,
        accountName,
        momoPhone,
        paymentMethod: paymentMethod || "VIETQR",
        qrUrl,
        transferNote,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [POST] /api/payment/confirm-paid - Xác nhận đã thanh toán
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

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
      message: "Xác nhận thanh toán thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
