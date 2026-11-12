const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

// [POST] /api/ai/chat - Trợ lý ảo AI Google Gemini RAG tư vấn đồng hồ
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập câu hỏi để trợ lý AI tư vấn!" });
    }

    // 1. Kỹ thuật RAG: Lấy dữ liệu sản phẩm đồng hồ thời gian thực từ CSDL MongoDB Atlas
    const products = await Product.find()
      .populate("category", "name slug")
      .select("name brand price salePrice originalPrice stock countInStock rating description category");

    const formattedProducts = products.map((p) => {
      const price = Number(p.salePrice || p.price || 0);
      const stock = p.stock !== undefined ? p.stock : (p.countInStock || 10);
      return {
        _id: p._id,
        name: p.name,
        brand: p.brand || "Chính Hãng",
        categoryName: p.category ? p.category.name : "Đồng hồ",
        salePrice: price,
        originalPrice: p.originalPrice || Math.round(price * 1.15),
        stock,
        rating: p.rating || 5.0,
        description: p.description || "Đồng hồ cao cấp chính hãng, bảo hành toàn diện.",
        image: p.image,
      };
    });

    // Tạo danh mục sản phẩm đưa vào Context Prompt (RAG)
    const productCatalog = formattedProducts
      .map(
        (p, idx) =>
          `${idx + 1}. [ID: ${p._id}] "${p.name}" | Thương hiệu: ${p.brand} | Phân loại: ${p.categoryName} | Giá bán: ${p.salePrice.toLocaleString("vi-VN")} đ | Tồn kho: ${p.stock} chiếc | Đánh giá: ${p.rating}⭐ | Đặc điểm: ${p.description}`
      )
      .join("\n");

    const systemInstruction = `
Bạn là "ChronoAI" - Chuyên gia tư vấn đồng hồ thời trang và cao cấp của Cửa Hàng Đồng Hồ Chronos (LHU Watch Store).
CƠ SỞ DỮ LIỆU ĐỒNG HỒ ĐANG CÓ SẴN TRONG KHO (MONGODB ATLAS):
${productCatalog}

QUY TẮC TƯ VẤN:
1. Luôn xưng hô lễ phép: xưng "Em" hoặc "ChronoAI / Shop", gọi khách là "Anh/Chị" hoặc "Quý khách".
2. CHỈ gợi ý các mẫu đồng hồ có thật trong danh sách trên, nêu rõ tên đầy đủ, thương hiệu, loại máy (cơ/quartz/smartwatch), tính năng nổi bật (kính sapphire, chống nước,...) và giá bán chính xác bằng VNĐ.
3. Nếu khách hỏi tầm giá (ví dụ dưới 5 triệu, từ 5 đến 15 triệu, hay cao cấp), hãy lọc đúng các sản phẩm phù hợp trong danh sách để tư vấn.
4. Cuối câu tư vấn, hãy nhiệt tình mời khách bấm nút "🛒 Thêm giỏ" hoặc "👁️ Xem chi tiết" ngay trên giao diện web để đặt hàng.
`;

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Gọi Google Gemini AI (RAG)
    if (apiKey && !apiKey.startsWith("AQ.Ab8")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction,
        });

        const prompt = `Khách hàng hỏi: "${message}". Hãy tư vấn chi tiết, ngắn gọn, chuẩn xác theo kho hàng.`;
        const result = await model.generateContent(prompt);

        return res.status(200).json({
          success: true,
          provider: "Google Gemini 1.5 Flash (RAG)",
          reply: result.response.text(),
        });
      } catch (err) {
        console.warn("Chuyển sang Bộ xử lý RAG thông minh dự phòng:", err.message);
      }
    }

    // 3. Bộ máy RAG thông minh dự phòng (Smart Fallback Engine)
    const lower = message.toLowerCase();
    let matched = formattedProducts.filter((p) => {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      const pCat = p.categoryName.toLowerCase();
      const pDesc = p.description.toLowerCase();

      // Kiểm tra từ khóa thương hiệu
      if (lower.includes("rolex") && (pBrand.includes("rolex") || pName.includes("rolex"))) return true;
      if (lower.includes("casio") && (pBrand.includes("casio") || pName.includes("casio"))) return true;
      if (lower.includes("seiko") && (pBrand.includes("seiko") || pName.includes("seiko"))) return true;
      if (lower.includes("tissot") && (pBrand.includes("tissot") || pName.includes("tissot"))) return true;
      if (lower.includes("citizen") && (pBrand.includes("citizen") || pName.includes("citizen"))) return true;
      if (lower.includes("apple") && (pBrand.includes("apple") || pName.includes("apple"))) return true;
      if (lower.includes("orient") && (pBrand.includes("orient") || pName.includes("orient"))) return true;

      // Kiểm tra phân loại
      if (lower.includes("nữ") && (pCat.includes("nữ") || pName.includes("nữ"))) return true;
      if (lower.includes("nam") && !lower.includes("nữ") && (pCat.includes("nam") || pName.includes("nam"))) return true;
      if ((lower.includes("cơ") || lower.includes("automatic") || lower.includes("lộ cơ")) && (pCat.includes("cơ") || pDesc.includes("cơ") || pName.includes("automatic"))) return true;
      if ((lower.includes("thông minh") || lower.includes("smartwatch") || lower.includes("watch")) && pCat.includes("thông minh")) return true;
      if ((lower.includes("điện tử") || lower.includes("quartz") || lower.includes("g-shock")) && (pCat.includes("điện tử") || pName.includes("g-shock") || pName.includes("vintage"))) return true;

      // Khoảng giá
      if ((lower.includes("rẻ") || lower.includes("bình dân") || lower.includes("dưới 3 triệu") || lower.includes("dưới 5 triệu")) && p.salePrice <= 5000000) return true;
      if ((lower.includes("cao cấp") || lower.includes("xa xỉ") || lower.includes("sang trọng")) && p.salePrice >= 15000000) return true;

      return pName.includes(lower) || pBrand.includes(lower) || pDesc.includes(lower);
    });

    const suggestions = matched.length > 0 ? matched.slice(0, 3) : formattedProducts.slice(0, 3);

    let reply = `Dạ ChronoAI chào Quý khách! Dựa trên yêu cầu **"${message}"**, Shop xin gợi ý các siêu phẩm đồng hồ cực kỳ phù hợp trong kho:\n\n`;

    suggestions.forEach((p) => {
      reply += `⌚ **${p.name}**\n`;
      reply += `• Thương hiệu: **${p.brand}** | Phân loại: ${p.categoryName}\n`;
      reply += `• Giá ưu đãi: **${p.salePrice.toLocaleString("vi-VN")} đ** (Giá gốc: ${p.originalPrice.toLocaleString("vi-VN")} đ) | ⭐ ${p.rating}/5.0\n`;
      reply += `• Tồn kho: **${p.stock}** chiếc | Điểm nổi bật: ${p.description}\n\n`;
    });

    reply += `👉 Quý khách có thể bấm trực tiếp vào nút **"🛒 Thêm giỏ"** hoặc **"👁️ Xem chi tiết"** trên màn hình để đặt hàng ngay. Shop cam kết 100% chính hãng, bảo hành chu đáo ạ!`;

    return res.status(200).json({
      success: true,
      provider: "ChronoAI RAG Engine (MongoDB Realtime)",
      reply,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
