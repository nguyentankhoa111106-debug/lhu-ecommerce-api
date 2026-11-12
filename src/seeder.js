require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB Atlas thành công.");

    console.log("🧹 Đang dọn dẹp dữ liệu cũ...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // 1. Tạo 2 tài khoản mẫu
    console.log("👥 Đang tạo tài khoản mẫu...");
    const adminUser = await User.create({
      name: "Quản Trị Viên Chronos LHU",
      email: "admin@lhu.edu.vn",
      password: "AdminPassword123@",
      phone: "0859635701",
      role: "admin",
    });

    const customerUser = await User.create({
      name: "Nguyễn Tấn Khoa (Khách Hàng)",
      email: "khachhang@gmail.com",
      password: "KhachPassword123@",
      phone: "0859635701",
      role: "customer",
    });

    console.log("✅ Đã tạo tài khoản:");
    console.log(" 👑 Admin: admin@lhu.edu.vn / AdminPassword123@");
    console.log(" 👤 Customer: khachhang@gmail.com / KhachPassword123@");

    // 2. Tạo 5 danh mục đồng hồ cao cấp
    console.log("📁 Đang tạo danh mục đồng hồ...");
    const catMen = await Category.create({
      name: "Đồng Hồ Nam",
      slug: "dong-ho-nam",
      description: "Bộ sưu tập đồng hồ nam lịch lãm, mạnh mẽ và sang trọng từ các thương hiệu hàng đầu thế giới.",
      image: "images/watches/rolex-submariner.jpg",
    });

    const catWomen = await Category.create({
      name: "Đồng Hồ Nữ",
      slug: "dong-ho-nu",
      description: "Thiết kế đồng hồ nữ quý phái, thanh lịch, đính đá và xà cừ tự nhiên tôn vinh vẻ đẹp phái nữ.",
      image: "images/watches/tissot-bella-ora-nu.jpg",
    });

    const catAutomatic = await Category.create({
      name: "Đồng Hồ Cơ Automatic",
      slug: "dong-ho-co-automatic",
      description: "Đỉnh cao cơ khí truyền thống Thụy Sĩ & Nhật Bản với bộ máy tự động tinh xảo không dùng pin.",
      image: "images/watches/orient-star-skeleton.jpg",
    });

    const catQuartz = await Category.create({
      name: "Đồng Hồ Điện Tử & Quartz",
      slug: "dong-ho-dien-tu-quartz",
      description: "Độ chính xác cao, bền bỉ, chống nước và đa dạng phong cách thể thao năng động.",
      image: "images/watches/casio-vintage-a168.jpg",
    });

    const catSmart = await Category.create({
      name: "Đồng Hồ Thông Minh (Smartwatch)",
      slug: "dong-ho-thong-minh",
      description: "Công nghệ hiện đại theo dõi sức khỏe, nhịp tim, oxy trong máu và kết nối thông minh.",
      image: "images/watches/apple-watch-ultra.jpg",
    });

    console.log("✅ Đã tạo 5 danh mục đồng hồ.");

    // 3. Tạo danh sách 12 sản phẩm đồng hồ chuẩn xác 100% hình ảnh
    console.log("⌚ Đang nạp sản phẩm đồng hồ...");
    const productsData = [
      {
        name: "Rolex Submariner Date Black Dial Thép 904L",
        brand: "Rolex",
        sku: "ROL-SUB-01",
        category: catAutomatic._id,
        originalPrice: 320000000,
        salePrice: 295000000,
        stock: 5,
        countInStock: 5,
        image: "images/watches/rolex-submariner.jpg",
        description: "Biểu tượng thợ lặn kinh điển. Thép không gỉ Oystersteel 904L, vành gốm Cerachrom chống trầy, bộ máy Calibre 3235 trữ cót 70h, kính Sapphire chống lóa, chống nước 300m.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Seiko 5 Sports Automatic Khaki Field Quân Đội",
        brand: "Seiko",
        sku: "SEI-SP5-02",
        category: catMen._id,
        originalPrice: 6800000,
        salePrice: 5490000,
        stock: 35,
        countInStock: 35,
        image: "images/watches/seiko-5-sports.jpg",
        description: "Phong cách quân đội dã ngoại cá tính. Máy cơ tự động 4R36 Nhật Bản trữ cót 41 giờ, dạ quang Lumibrite siêu sáng, kính Hardlex độc quyền, chống nước 100m.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Tissot Le Locle Powermatic 80 Thụy Sĩ Cổ Điển",
        brand: "Tissot",
        sku: "TIS-LOC-03",
        category: catAutomatic._id,
        originalPrice: 17500000,
        salePrice: 14800000,
        stock: 20,
        countInStock: 20,
        image: "images/watches/tissot-le-locle.jpg",
        description: "Tuyệt tác phong cách cổ điển Thụy Sĩ. Họa tiết vân Guilloche Paris trứ danh, kính Sapphire nguyên khối chống trầy, cỗ máy Powermatic 80 trữ cót lên đến 80 giờ.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Casio G-Shock GA-2100 'CasiOak' All Black Lõi Carbon",
        brand: "Casio",
        sku: "CAS-GSH-04",
        category: catQuartz._id,
        originalPrice: 3900000,
        salePrice: 3150000,
        stock: 50,
        countInStock: 50,
        image: "images/watches/casio-gshock.jpg",
        description: "Dòng đồng hồ thể thao bát giác siêu mỏng. Cấu trúc Carbon Core Guard siêu bền chống va đập cực hạn, chống nước 200m, kim dạ quang và 2 đèn LED đôi.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Citizen Eco-Drive Titan Sapphire Năng Lượng Ánh Sáng",
        brand: "Citizen",
        sku: "CIT-ECO-05",
        category: catMen._id,
        originalPrice: 9200000,
        salePrice: 7850000,
        stock: 28,
        countInStock: 28,
        image: "images/watches/citizen-ecodrive.jpg",
        description: "Công nghệ sạc năng lượng ánh sáng độc quyền Eco-Drive không bao giờ cần thay pin. Thân vỏ Titanium siêu nhẹ chống dị ứng, kính Sapphire chống xước tuyệt đối.",
        rating: 4.8,
        isFeatured: true,
      },
      {
        name: "Đồng Hồ Nữ Citizen L Sunrise Khảm Xà Cừ Đính Kim Cương",
        brand: "Citizen",
        sku: "CIT-SUN-06",
        category: catWomen._id,
        originalPrice: 12500000,
        salePrice: 9900000,
        stock: 15,
        countInStock: 15,
        image: "images/watches/citizen-sunrise-nu.jpg",
        description: "Vẻ đẹp thuần khiết quý phái dành cho phái đẹp. Mặt số khảm xà cừ tự nhiên đính kim cương lấp lánh, vỏ mạ vàng hồng PVD sang trọng, kính Sapphire uốn cong.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Đồng Hồ Nữ Casio Sheen Dây Da Bò Cao Cấp",
        brand: "Casio",
        sku: "CAS-SHE-07",
        category: catWomen._id,
        originalPrice: 4500000,
        salePrice: 3690000,
        stock: 40,
        countInStock: 40,
        image: "images/watches/casio-sheen-nu.jpg",
        description: "Thiết kế tối giản nữ tính dành cho quý cô công sở. Dây da bò thật dập vân cá sấu, viền pha lê Swarovski tinh tế, cọc số La Mã cổ điển, chống nước 50m.",
        rating: 4.8,
        isFeatured: true,
      },
      {
        name: "Apple Watch Ultra 2 Titanium 49mm Dây Alpine",
        brand: "Apple",
        sku: "APP-ULT-08",
        category: catSmart._id,
        originalPrice: 22990000,
        salePrice: 20490000,
        stock: 25,
        countInStock: 25,
        image: "images/watches/apple-watch-ultra.jpg",
        description: "Đỉnh cao smartwatch thể thao dã ngoại. Vỏ Titanium chuẩn hàng không vũ trụ 49mm, màn hình Retina 3000 nits siêu sáng, GPS băng tần kép, đo ECG và SpO2.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Samsung Galaxy Watch 6 Classic Viền Bezel Xoay",
        brand: "Samsung",
        sku: "SAM-GW6-09",
        category: catSmart._id,
        originalPrice: 8990000,
        salePrice: 7290000,
        stock: 30,
        countInStock: 30,
        image: "images/watches/samsung-galaxy-watch.jpg",
        description: "Viền bezel xoay vật lý trứ danh cùng màn hình Super AMOLED sắc nét. Theo dõi giấc ngủ chuyên sâu, đo huyết áp, điện tâm đồ, pin sử dụng liên tục 40 giờ.",
        rating: 4.7,
        isFeatured: false,
      },
      {
        name: "Orient Star Skeleton Lộ Cơ Khung Xương Thượng Hạng",
        brand: "Orient",
        sku: "ORI-STA-10",
        category: catAutomatic._id,
        originalPrice: 34000000,
        salePrice: 29500000,
        stock: 8,
        countInStock: 8,
        image: "images/watches/orient-star-skeleton.jpg",
        description: "Nghệ thuật cơ khí lộ khung xương tuyệt mỹ Skeleton. Toàn bộ chuyển động nhịp nhàng của bánh răng và dây tóc lộ rõ dưới lớp kính Sapphire phủ chống lóa.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Casio Vintage A168 Dây Kim Loại Bạc Cổ Điển",
        brand: "Casio",
        sku: "CAS-VIN-11",
        category: catQuartz._id,
        originalPrice: 1150000,
        salePrice: 890000,
        stock: 80,
        countInStock: 80,
        image: "images/watches/casio-vintage-a168.jpg",
        description: "Huyền thoại retro thập niên 80. Vỏ mạ chrome sáng bóng, đèn nền Illuminator xanh lam dạ quang, lịch tự động và pin bền bỉ 7 năm, báo thức hằng ngày.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Đồng Hồ Nữ Tissot Bella Ora Dây Lưới Vàng Hồng",
        brand: "Tissot",
        sku: "TIS-BEL-12",
        category: catWomen._id,
        originalPrice: 11200000,
        salePrice: 8990000,
        stock: 18,
        countInStock: 18,
        image: "images/watches/tissot-bella-ora-nu.jpg",
        description: "Ý tưởng thiết kế từ kinh đô thời trang Milan. Mặt số oval độc đáo với kim giây rốn góc 6 giờ, dây lưới thép không gỉ mạ vàng hồng PVD mềm mại ôm sát cổ tay.",
        rating: 5.0,
        isFeatured: true,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`✅ Đã nạp ${insertedProducts.length} sản phẩm đồng hồ thành công!`);

    // 4. Tạo 1 đơn hàng mẫu
    console.log("📝 Đang tạo đơn hàng mẫu...");
    await Order.create({
      orderCode: "DH" + Date.now().toString().slice(-8),
      user: customerUser._id,
      customerName: "Nguyễn Tấn Khoa",
      customerPhone: "0859635701",
      customerEmail: "khachhang@gmail.com",
      shippingAddress: "Trường Đại học Lạc Hồng, Biên Hòa, Đồng Nai",
      items: [
        {
          productId: insertedProducts[3]._id,
          name: insertedProducts[3].name,
          quantity: 1,
          price: insertedProducts[3].salePrice,
          image: insertedProducts[3].image,
        },
      ],
      shippingFee: 25000,
      totalAmount: insertedProducts[3].salePrice + 25000,
      paymentMethod: "VIETQR",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      note: "Giao hàng giờ hành chính giúp em",
    });

    console.log("🎉 Nạp toàn bộ dữ liệu Cửa Hàng Đồng Hồ Chronos hoàn tất!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi nạp dữ liệu:", error);
    process.exit(1);
  }
};

seedData();
