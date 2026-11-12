const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm không được để trống"],
      trim: true,
    },
    brand: {
      type: String,
      default: "Chính Hãng",
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Vui lòng chọn danh mục sản phẩm"],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, "Vui lòng nhập giá bán"],
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
    },
    countInStock: {
      type: Number,
      default: 10,
    },
    image: {
      type: String,
      default: "images/watches/rolex-submariner.jpg",
    },
    description: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Đồng bộ giá & tồn kho trước khi lưu
productSchema.pre("save", function (next) {
  if (!this.salePrice && this.price) this.salePrice = this.price;
  if (!this.price && this.salePrice) this.price = this.salePrice;
  if (!this.originalPrice || this.originalPrice < this.salePrice) {
    this.originalPrice = Math.round(this.salePrice * 1.15); // Giá gốc niêm yết
  }
  if (this.stock !== undefined && (this.countInStock === undefined || this.countInStock === 10)) {
    this.countInStock = this.stock;
  }
  if (this.countInStock !== undefined && this.stock === undefined) {
    this.stock = this.countInStock;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
