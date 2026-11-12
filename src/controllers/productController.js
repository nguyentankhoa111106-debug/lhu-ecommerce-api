const Product = require("../models/Product");

// [GET] /api/products - Lấy danh sách sản phẩm (Lọc, Tìm kiếm Regex, Phân trang, Sắp xếp)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page, limit } = req.query;
    const filter = {};

    // 1. Lọc theo Danh mục
    if (category) {
      filter.category = category;
    }

    // 2. Tìm kiếm Regex tên sản phẩm & thương hiệu không phân biệt hoa thường
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [{ name: searchRegex }, { brand: searchRegex }];
    }

    // 3. Lọc theo khoảng giá (minPrice / maxPrice hoặc gte / lte)
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    // 4. Sắp xếp
    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { salePrice: 1 };
    if (sort === "price_desc") sortQuery = { salePrice: -1 };
    if (sort === "name_asc") sortQuery = { name: 1 };
    if (sort === "rating_desc") sortQuery = { rating: -1 };

    // 5. Tổng số sản phẩm khớp bộ lọc
    const total = await Product.countDocuments(filter);

    // 6. Phân trang chuyên nghiệp (nếu có tham số limit, ngược lại trả về toàn bộ)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0; // 0 nghĩa là lấy tất cả
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 1;

    let query = Product.find(filter)
      .populate("category", "name slug")
      .sort(sortQuery);

    if (limitNum > 0) {
      query = query.skip(skipNum).limit(limitNum);
    }

    const products = await query;

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      total,
      page: pageNum,
      limit: limitNum || total,
      totalPages,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/products/:id - Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug description"
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm yêu cầu!" });
    }
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [POST] /api/products - Thêm sản phẩm mới (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      originalPrice,
      salePrice,
      price,
      stock,
      countInStock,
      image,
      description,
      isFeatured,
      rating,
    } = req.body;

    const finalSalePrice = Number(salePrice || price || 0);

    if (!name || !category || finalSalePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ: Tên sản phẩm, Danh mục và Giá bán hợp lệ!",
      });
    }

    const finalStock = Number(stock !== undefined ? stock : (countInStock !== undefined ? countInStock : 10));

    const newProduct = await Product.create({
      name: name.trim(),
      category,
      brand: brand ? brand.trim() : "Chính Hãng",
      originalPrice: Number(originalPrice) || Math.round(finalSalePrice * 1.15),
      salePrice: finalSalePrice,
      price: finalSalePrice,
      stock: finalStock,
      countInStock: finalStock,
      image: image || "images/watches/rolex-submariner.jpg",
      description: description ? description.trim() : "",
      rating: Number(rating) || 5.0,
      isFeatured: Boolean(isFeatured),
    });

    const populated = await Product.findById(newProduct._id).populate(
      "category",
      "name slug"
    );
    res.status(201).json({
      success: true,
      message: "Thêm sản phẩm mới thành công",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/products/:id - Cập nhật sản phẩm (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.salePrice) {
      updateData.price = updateData.salePrice;
    }
    if (updateData.stock !== undefined) {
      updateData.countInStock = updateData.stock;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] /api/products/:id - Xóa sản phẩm (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm để xóa!" });
    }
    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
