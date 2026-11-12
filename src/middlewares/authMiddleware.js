const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Middleware kiểm tra Token (Protect Route)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập! Vui lòng gửi kèm mã Token (Bearer Token).",
    });
  }

  try {
    const secret =
      process.env.JWT_SECRET || "LhuEcommerceSecretKey2026SuperSecure@!#";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded._id;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản sở hữu token này không tồn tại trên hệ thống!",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Mã Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

// 2. Middleware phân quyền linh hoạt theo Rubric: authorize("admin")
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối! Chức năng này yêu cầu vai trò: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

// 3. Alias adminOnly
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message:
        "Quyền truy cập bị từ chối! Chức năng này chỉ dành cho Quản trị viên (Admin).",
    });
  }
};
