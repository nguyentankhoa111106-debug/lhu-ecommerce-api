/**
 * CẤU HÌNH KẾT NỐI API RESTFUL BACKEND CHO CỬA HÀNG ĐỒNG HỒ CHRONOS
 * Tự động tương thích cả khi chạy Localhost:5000, Live Server hoặc Cloud Render
 */
const API_BASE_URL =
  window.location.protocol.startsWith("http") && window.location.port === "5000"
    ? `${window.location.origin}/api`
    : window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;

const API = {
  // ==========================
  // 1. DANH MỤC (CATEGORIES)
  // ==========================
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      return await res.json();
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      return { success: false, data: [] };
    }
  },

  async createCategory(categoryData, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers,
        body: JSON.stringify(categoryData),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi tạo danh mục:", err);
      return { success: false, message: err.message };
    }
  },

  async deleteCategory(id, token) {
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers,
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi xóa danh mục:", err);
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // 2. SẢN PHẨM ĐỒNG HỒ (PRODUCTS)
  // ==========================
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category) query.append("category", params.category);
      if (params.search) query.append("search", params.search);
      if (params.minPrice) query.append("minPrice", params.minPrice);
      if (params.maxPrice) query.append("maxPrice", params.maxPrice);
      if (params.sort) query.append("sort", params.sort);
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);

      const url = `${API_BASE_URL}/products${query.toString() ? "?" + query.toString() : ""}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error("Lỗi lấy sản phẩm đồng hồ:", err);
      return { success: false, data: [] };
    }
  },

  async getProductById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      return await res.json();
    } catch (err) {
      console.error("Lỗi lấy chi tiết sản phẩm:", err);
      return { success: false, message: "Lỗi kết nối máy chủ" };
    }
  },

  async createProduct(productData, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      return { success: false, message: err.message };
    }
  },

  async updateProduct(id, productData, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);
      return { success: false, message: err.message };
    }
  },

  async deleteProduct(id, token) {
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers,
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // 3. XÁC THỰC & TÀI KHOẢN (AUTH)
  // ==========================
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      return { success: false, message: "Không thể kết nối đến máy chủ API" };
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      return { success: false, message: "Không thể kết nối đến máy chủ API" };
    }
  },

  async getMe(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // 4. ĐƠN HÀNG (ORDERS)
  // ==========================
  async createOrder(orderData, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      return { success: false, message: err.message };
    }
  },

  async getOrders(token) {
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders`, { headers });
      return await res.json();
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
      return { success: false, data: [] };
    }
  },

  async getMyOrders(token, email, phone) {
    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = `${API_BASE_URL}/orders/myorders`;
      const query = new URLSearchParams();
      if (email) query.append("email", email);
      if (phone) query.append("phone", phone);
      if (query.toString()) url += `?${query.toString()}`;

      const res = await fetch(url, { headers });
      return await res.json();
    } catch (err) {
      console.error("Lỗi lấy đơn cá nhân:", err);
      return { success: false, data: [] };
    }
  },

  // Nút thao tác trực tiếp duyệt thanh toán (Rubric 3.2)
  async payOrder(id, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
        method: "PUT",
        headers,
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi duyệt thanh toán:", err);
      return { success: false, message: err.message };
    }
  },

  // Nút thao tác trực tiếp xác nhận đã giao hàng (Rubric 3.2)
  async deliverOrder(id, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders/${id}/deliver`, {
        method: "PUT",
        headers,
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi xác nhận giao hàng:", err);
      return { success: false, message: err.message };
    }
  },

  async updateOrderStatus(id, status, token) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi cập nhật đơn hàng:", err);
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // 5. THANH TOÁN QR (VIETQR / MOMO)
  // ==========================
  async createPaymentQR(orderId, paymentMethod) {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/create-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentMethod }),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi tạo mã thanh toán QR:", err);
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // 6. TRỢ LÝ ẢO AI GEMINI (RAG)
  // ==========================
  async askAI(message) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return await res.json();
    } catch (err) {
      console.error("Lỗi gọi AI Chatbot:", err);
      return {
        success: false,
        reply:
          "Dạ hệ thống AI đang xử lý yêu cầu hoặc chưa bật máy chủ Backend. Quý khách vui lòng thử lại sau ít giây nhé!",
      };
    }
  },
};
