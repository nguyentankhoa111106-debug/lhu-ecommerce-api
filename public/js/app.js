/**
 * ==========================================================================
 * LOGIC TƯƠNG TÁC GIAO DIỆN CỬA HÀNG ĐỒNG HỒ CHRONOS (FRONTEND STOREFRONT)
 * Học phần: Lập Trình Ứng Dụng - Chuyên Ngành TMĐT - ĐH Lạc Hồng
 * ==========================================================================
 */

// Trạng thái ứng dụng
let currentCategory = "";
let currentSearch = "";
let currentMinPrice = "";
let currentMaxPrice = "";
let currentSort = "";
let currentSlideIndex = 0;
let carouselTimer = null;

// Giỏ hàng lưu trữ an toàn trong localStorage
let cart = JSON.parse(localStorage.getItem("CHRONOS_CART") || "[]");

// Khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  initCarousel();
  initCategories();
  initPriceFilters();
  loadProducts();
  updateCartUI();
  setupEventListeners();
});

// ==========================================================================
// 1. QUẢN LÝ TÀI KHOẢN & AUTH UI
// ==========================================================================
function initAuthUI() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const authHeader = document.getElementById("authHeaderArea");

  if (!authHeader) return;

  if (token && user) {
    authHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 13px; color: #fbbf24; font-weight: 600;">
          👤 ${user.name ? user.name.split(" ").slice(-2).join(" ") : user.email}
        </span>
        <button class="btn-auth-action" onclick="handleLogout()" style="padding: 6px 12px; font-size: 12px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4);" title="Đăng xuất">
          Đăng xuất
        </button>
      </div>
    `;

    // Điền sẵn thông tin khách vào form đặt hàng
    const nameInput = document.getElementById("orderCustName");
    const emailInput = document.getElementById("orderCustEmail");
    const phoneInput = document.getElementById("orderCustPhone");
    if (nameInput && !nameInput.value) nameInput.value = user.name || "";
    if (emailInput && !emailInput.value) emailInput.value = user.email || "";
    if (phoneInput && !phoneInput.value && user.phone) phoneInput.value = user.phone;
  } else {
    authHeader.innerHTML = `
      <button class="btn-auth-action" onclick="openAuthModal()">
        👤 <span id="authBtnText">Đăng Nhập</span>
      </button>
    `;
  }
}

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

async function handleUserLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const res = await API.login(email, password);
  if (res.success && res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    alert(`🎉 Đăng nhập thành công! Chào mừng ${res.user.name}`);
    closeAuthModal();
    initAuthUI();
  } else {
    alert("❌ Đăng nhập thất bại: " + (res.message || "Email hoặc mật khẩu không đúng!"));
  }
}

function handleLogout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    initAuthUI();
    alert("Đã đăng xuất tài khoản.");
  }
}

// ==========================================================================
// 2. BANNER CAROUSEL QUẢNG CÁO ĐỒNG HỒ
// ==========================================================================
function initCarousel() {
  const slides = document.getElementById("carouselSlides");
  if (!slides) return;

  goToSlide(0);
  startCarouselAutoPlay();

  const container = document.getElementById("watchCarousel");
  if (container) {
    container.addEventListener("mouseenter", () => clearInterval(carouselTimer));
    container.addEventListener("mouseleave", () => startCarouselAutoPlay());
  }
}

function startCarouselAutoPlay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    nextSlide();
  }, 5000);
}

function goToSlide(index) {
  const slides = document.getElementById("carouselSlides");
  const indicators = document.querySelectorAll(".indicator-dot");
  if (!slides) return;

  const totalSlides = slides.children.length;
  currentSlideIndex = (index + totalSlides) % totalSlides;

  slides.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

  indicators.forEach((dot, idx) => {
    if (idx === currentSlideIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1);
}

function prevSlide() {
  goToSlide(currentSlideIndex - 1);
}

function filterByQuickCat(categoryName) {
  const pills = document.querySelectorAll("#categoryPills .cat-pill");
  pills.forEach((p) => {
    if (p.innerText.trim().toLowerCase() === categoryName.trim().toLowerCase()) {
      p.click();
    }
  });
  // Cuộn mượt xuống khu vực sản phẩm
  document.querySelector(".products-section")?.scrollIntoView({ behavior: "smooth" });
}

// ==========================================================================
// 3. KHỞI TẠO BỘ LỌC DANH MỤC & KHOẢNG GIÁ
// ==========================================================================
async function initCategories() {
  const catList = document.getElementById("categoryPills");
  if (!catList) return;

  const res = await API.getCategories();
  if (res.success && Array.isArray(res.data)) {
    let html = `<button class="cat-pill active" data-id="">Tất cả</button>`;
    res.data.forEach((cat) => {
      html += `<button class="cat-pill" data-id="${cat._id}">${cat.name}</button>`;
    });
    catList.innerHTML = html;

    // Gán sự kiện click lọc danh mục tức thì
    catList.querySelectorAll(".cat-pill").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        catList.querySelectorAll(".cat-pill").forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        currentCategory = e.currentTarget.getAttribute("data-id");
        loadProducts();
      });
    });
  }
}

function initPriceFilters() {
  const pricePills = document.querySelectorAll("#pricePills .price-pill");
  pricePills.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      pricePills.forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      currentMinPrice = e.currentTarget.getAttribute("data-min") || "";
      currentMaxPrice = e.currentTarget.getAttribute("data-max") || "";
      loadProducts();
    });
  });
}

// ==========================================================================
// 4. TẢI VÀ KẾT NỐI API HIỂN THỊ SẢN PHẨM (DOM RENDERING)
// ==========================================================================
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productCount");
  if (!grid) return;

  grid.innerHTML = `
    <div class="state-box" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
      <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 8px;">⏳ Đang đồng bộ danh mục đồng hồ từ MongoDB Atlas...</h3>
      <p style="color: #64748b; font-size: 14px;">Vui lòng đợi giây lát...</p>
    </div>
  `;

  const res = await API.getProducts({
    category: currentCategory,
    search: currentSearch,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    sort: currentSort,
  });

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    if (countEl) countEl.innerText = `Tìm thấy ${res.data.length} mẫu đồng hồ`;

    grid.innerHTML = res.data
      .map((p) => {
        const salePrice = Number(p.salePrice || p.price || 0);
        const originalPrice = Number(p.originalPrice || Math.round(salePrice * 1.15));
        const discount =
          originalPrice > salePrice
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0;
        const catName = p.category ? (p.category.name || p.category) : "Đồng Hồ";
        const brand = p.brand || "Chính Hãng";
        const imgUrl =
          p.image || "images/watches/rolex-submariner.jpg";
        const stockCount = p.stock !== undefined ? p.stock : (p.countInStock || 10);

        return `
          <div class="product-card">
            <div class="product-thumb-wrap">
              <img src="${imgUrl}" alt="${p.name}" class="product-thumb" onerror="this.src='images/watches/rolex-submariner.jpg'">
              ${discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : ""}
              <span class="brand-tag">${brand}</span>
            </div>
            <div class="product-details">
              <span class="product-category-name">${catName}</span>
              <h4 class="product-name" title="${p.name}">${p.name}</h4>
              <div class="product-rating">
                ★ ${p.rating || 5.0} 
                <span style="color: #64748b; font-size: 12px; font-weight: normal; margin-left: 4px;">
                  (Kho: ${stockCount})
                </span>
              </div>
              <div class="price-container">
                <span class="sale-price">${salePrice.toLocaleString("vi-VN")} đ</span>
                ${originalPrice > salePrice ? `<span class="original-price">${originalPrice.toLocaleString("vi-VN")} đ</span>` : ""}
              </div>
              <div class="card-actions">
                <button class="btn-add-cart" onclick="addToCart('${p._id}', '${escapeQuotes(p.name)}', ${salePrice}, '${imgUrl}')">
                  🛒 Thêm giỏ
                </button>
                <button class="btn-view-quick" onclick="viewProductDetail('${p._id}')" title="Xem thông số kỹ thuật">
                  👁️
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  } else {
    if (countEl) countEl.innerText = "0 mẫu đồng hồ";
    grid.innerHTML = `
      <div class="state-box" style="grid-column: 1 / -1; text-align: center; padding: 70px 20px;">
        <p style="font-size: 42px; margin-bottom: 10px;">🔍</p>
        <h3 style="font-size: 20px; color: #0f172a; margin-bottom: 8px;">Không tìm thấy mẫu đồng hồ nào phù hợp!</h3>
        <p style="color: #64748b; font-size: 14px;">Quý khách vui lòng thử chọn khoảng giá khác, gõ từ khóa khác hoặc bấm nút "Tất cả" danh mục nhé.</p>
      </div>
    `;
  }
}

// ==========================================================================
// 5. QUẢN LÝ GIỎ HÀNG (SHOPPING CART & LOCALSTORAGE)
// ==========================================================================
function addToCart(id, name, price, image) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  openCartDrawer();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("CHRONOS_CART", JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const badge = document.getElementById("cartBadge");
  const countHeader = document.getElementById("cartCountHeader");
  if (badge) badge.innerText = totalCount;
  if (countHeader) countHeader.innerText = totalCount;

  const body = document.getElementById("cartItemsBody");
  const subtotal = document.getElementById("cartSubtotal");

  if (subtotal) subtotal.innerText = `${totalPrice.toLocaleString("vi-VN")} đ`;

  if (body) {
    if (cart.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 60px 10px; color: #94a3b8;">
          <p style="font-size: 48px; margin-bottom: 12px;">🛒</p>
          <p style="font-size: 15px; font-weight: 600; color: #475569;">Giỏ hàng của bạn đang trống!</p>
          <p style="font-size: 13px; margin-top: 6px;">Hãy khám phá các mẫu đồng hồ tuyệt mỹ và thêm vào giỏ.</p>
        </div>
      `;
    } else {
      body.innerHTML = cart
        .map(
          (i) => `
          <div class="cart-item">
            <img src="${i.image}" class="cart-item-img" alt="${i.name}">
            <div class="cart-item-info">
              <h5 class="cart-item-name">${i.name}</h5>
              <div class="cart-item-price">${(i.price * i.quantity).toLocaleString("vi-VN")} đ</div>
              <div class="qty-control">
                <button class="qty-btn" onclick="changeQty('${i.id}', -1)">-</button>
                <span class="qty-val">${i.quantity}</span>
                <button class="qty-btn" onclick="changeQty('${i.id}', 1)">+</button>
              </div>
            </div>
            <button class="btn-item-del" onclick="removeFromCart('${i.id}')" title="Xóa mẫu này">✕</button>
          </div>
        `
        )
        .join("");
    }
  }
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    backdrop.style.display = "block";
    setTimeout(() => drawer.classList.add("open"), 10);
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("open");
    setTimeout(() => {
      backdrop.style.display = "none";
    }, 300);
  }
}

// ==========================================================================
// 6. CHECKOUT FORM & QUÉT MÃ VIETQR (HDBANK - NGUYEN TAN KHOA)
// ==========================================================================
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống! Vui lòng chọn đồng hồ trước khi đặt hàng.");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("hidden");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("hidden");
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById("btnSubmitOrder");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Đang kết nối máy chủ đặt hàng...";
  }

  const customerName = form.customerName.value.trim();
  const customerPhone = form.customerPhone.value.trim();
  const customerEmail = form.customerEmail.value.trim();
  const shippingAddress = form.shippingAddress.value.trim();
  const paymentMethod = form.paymentMethod.value;
  const note = form.note ? form.note.value.trim() : "";

  const token = localStorage.getItem("token");

  // Chuẩn bị dữ liệu gửi POST /api/orders (Zero-Trust Pricing)
  const orderData = {
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    paymentMethod,
    note,
    items: cart.map((i) => ({
      productId: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    shippingFee: 25000,
  };

  const res = await API.createOrder(orderData, token);
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = "Xác Nhận Đặt Hàng & Sinh Mã Thanh Toán";
  }

  if (res.success && res.data) {
    const createdOrder = res.data;

    // Làm rỗng giỏ hàng đồng bộ trong localStorage
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();

    if (paymentMethod === "VIETQR" || paymentMethod === "MOMO_QR") {
      showQRModal(createdOrder, paymentMethod);
    } else {
      alert(
        `🎉 Đặt hàng thành công!\n` +
        `Mã đơn hàng: #${createdOrder.orderCode || createdOrder._id}\n` +
        `Tổng tiền: ${Number(createdOrder.totalAmount).toLocaleString("vi-VN")} đ\n` +
        `Cảm ơn Quý khách đã tin tưởng Chronos Luxury Watches!`
      );
    }
  } else {
    alert(`❌ Đặt hàng thất bại: ${res.message || "Lỗi xử lý đơn hàng"}`);
  }
}

// Popup hiển thị mã VietQR động theo chuẩn Napas 247 gắn đúng orderId & số tiền
function showQRModal(order, method) {
  const modal = document.getElementById("qrModal");
  const qrImg = document.getElementById("qrImage");
  const orderCodeEl = document.getElementById("qrOrderCode");
  const totalEl = document.getElementById("qrTotalAmount");
  const noteEl = document.getElementById("qrTransferNote");

  const totalAmount = order.totalAmount || 0;
  const orderCode = order.orderCode || order._id.slice(-8).toUpperCase();

  if (orderCodeEl) orderCodeEl.innerText = `#${orderCode}`;
  if (totalEl) totalEl.innerText = `${totalAmount.toLocaleString("vi-VN")} đ`;
  if (noteEl) noteEl.innerText = `DH ${orderCode}`;

  // Chuẩn VietQR (HDBank - 0859635701 - NGUYEN TAN KHOA)
  const bankId = "HDB";
  const accountNo = "0859635701";
  const accountName = encodeURIComponent("NGUYEN TAN KHOA");
  const addInfo = encodeURIComponent(`DH ${orderCode}`);

  if (qrImg) {
    if (method === "VIETQR") {
      qrImg.src = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${addInfo}&accountName=${accountName}`;
    } else {
      // MoMo QR chuẩn mạng lưới Napas
      qrImg.src = `https://img.vietqr.io/image/MOMO-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${addInfo}&accountName=${accountName}`;
    }
  }

  if (modal) modal.classList.remove("hidden");
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("hidden");
  alert(
    "🎉 Cảm ơn Quý khách! Đơn hàng của bạn đã được ghi nhận trên hệ thống.\n" +
    "Quản trị viên sẽ kiểm tra và duyệt thanh toán tức thì."
  );
}

// ==========================================================================
// 7. XEM CHI TIẾT SẢN PHẨM ĐỒNG HỒ
// ==========================================================================
async function viewProductDetail(id) {
  const modal = document.getElementById("productDetailModal");
  const content = document.getElementById("productDetailContent");
  if (!modal || !content) return;

  content.innerHTML = `<p style="text-align: center; padding: 40px; color: #64748b;">⏳ Đang tải thông số kỹ thuật...</p>`;
  modal.classList.remove("hidden");

  const res = await API.getProductById(id);
  if (res.success && res.data) {
    const p = res.data;
    const catName = p.category ? (p.category.name || p.category) : "Đồng Hồ";
    const brand = p.brand || "Chính Hãng";
    const salePrice = Number(p.salePrice || p.price || 0);
    const originalPrice = Number(p.originalPrice || Math.round(salePrice * 1.15));
    const stockCount = p.stock !== undefined ? p.stock : (p.countInStock || 10);
    const imgUrl = p.image || "images/watches/rolex-submariner.jpg";

    content.innerHTML = `
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; text-align: center;">
          <img src="${imgUrl}" style="width: 100%; max-width: 280px; height: 280px; object-fit: cover; border-radius: 12px; box-shadow: var(--shadow-md);">
        </div>
        <div style="flex: 1.3; min-width: 250px;">
          <span style="font-size: 12px; color: #d97706; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${catName}</span>
          <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 6px 0 10px 0;">${p.name}</h3>
          <div style="font-size: 13.5px; color: #475569; margin-bottom: 12px;">
            Thương hiệu: <strong style="color: #0f172a;">${brand}</strong> | ⭐ <strong>${p.rating || 5.0} / 5.0</strong>
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #dc2626; margin-bottom: 14px;">
            ${salePrice.toLocaleString("vi-VN")} đ
            ${originalPrice > salePrice ? `<span style="font-size: 14px; color: #94a3b8; text-decoration: line-through; margin-left: 8px;">${originalPrice.toLocaleString("vi-VN")} đ</span>` : ""}
          </div>
          <div style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 18px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${p.description || "Đồng hồ cao cấp nguyên hộp chính hãng, bảo hành toàn diện 5 năm."}
          </div>
          <div style="font-size: 13px; color: #0f172a; margin-bottom: 18px;">
            📦 Tình trạng kho: <strong style="color: ${stockCount > 0 ? '#10b981' : '#ef4444'};">${stockCount > 0 ? `Còn ${stockCount} chiếc sẵn sàng giao` : 'Hết hàng tạm thời'}</strong>
          </div>
          <button class="btn-checkout-start" onclick="addToCart('${p._id}', '${escapeQuotes(p.name)}', ${salePrice}, '${imgUrl}'); closeProductDetailModal();">
            🛒 Thêm Vào Giỏ Hàng
          </button>
        </div>
      </div>
    `;
  }
}

function closeProductDetailModal() {
  const modal = document.getElementById("productDetailModal");
  if (modal) modal.classList.add("hidden");
}

// ==========================================================================
// 8. TÌM KIẾM THỜI GIAN THỰC (DEBOUNCE) & SẮP XẾP
// ==========================================================================
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadProducts();
      }, 350); // Debounce 350ms theo đúng tiêu chí chấm điểm
    });
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }
}

function escapeQuotes(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
